import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ error: 'Missing authorization' }, 401)

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: authData, error: authError } = await userClient.auth.getUser()
  if (authError || !authData.user) return json({ error: 'Unauthorized' }, 401)

  const service = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
  const { data: adminProfile } = await service
    .from('profiles')
    .select('role,is_active')
    .eq('id', authData.user.id)
    .single()

  if (adminProfile?.role !== 'admin' || adminProfile.is_active !== true) {
    return json({ error: 'Admin access required' }, 403)
  }

  const body = await req.json()

  if (body.action === 'create') {
    const email = String(body.email ?? '').trim().toLowerCase()
    const full_name = String(body.full_name ?? '').trim()
    const role = String(body.role ?? 'viewer')
    const property_ids = Array.isArray(body.property_ids) ? body.property_ids.filter((id: unknown) => typeof id === 'string') : []
    if (!email || !full_name) return json({ error: 'Email and name are required' }, 400)
    if (!['admin', 'manager', 'viewer', 'cleaning'].includes(role)) return json({ error: 'Invalid role' }, 400)

    const temporary_password = `PmStay-${crypto.randomUUID().slice(0, 12)}!`
    const { data: created, error: createError } = await service.auth.admin.createUser({
      email,
      password: temporary_password,
      email_confirm: true,
      user_metadata: { full_name, role },
    })
    if (createError || !created.user) return json({ error: createError?.message ?? 'Unable to create user' }, 400)

    const { error: profileError } = await service.from('profiles').upsert({
      id: created.user.id, email, full_name, role, is_active: true,
    })
    if (profileError) { await service.auth.admin.deleteUser(created.user.id); return json({ error: profileError.message }, 500) }

    if (property_ids.length) {
      const { error: accessError } = await service.from('property_access').upsert(
        property_ids.map((property_id: string) => ({ user_id: created.user!.id, property_id })),
        { onConflict: 'user_id,property_id' },
      )
      if (accessError) { await service.from('profiles').delete().eq('id', created.user.id); await service.auth.admin.deleteUser(created.user.id); return json({ error: accessError.message }, 500) }
    }

    return json({ id: created.user.id, email, temporary_password })
  }

  if (body.action === 'invite') {
    const email = String(body.email ?? '').trim().toLowerCase()
    const full_name = String(body.full_name ?? '').trim()
    const role = String(body.role ?? 'viewer')
    const property_ids = Array.isArray(body.property_ids) ? body.property_ids.filter((id: unknown) => typeof id === 'string') : []
    if (!email || !full_name) return json({ error: 'Email and name are required' }, 400)
    if (!['admin', 'manager', 'viewer', 'cleaning'].includes(role)) return json({ error: 'Invalid role' }, 400)

    const { data: invited, error: inviteError } = await service.auth.admin.inviteUserByEmail(email, {
      data: { full_name, role },
    })
    if (inviteError || !invited.user) return json({ error: inviteError?.message ?? 'Unable to invite user' }, 400)

    const { error: profileError } = await service.from('profiles').upsert({
      id: invited.user.id,
      email,
      full_name,
      role,
      is_active: true,
    })
    if (profileError) return json({ error: profileError.message }, 500)

    if (property_ids.length) {
      const { error: accessError } = await service.from('property_access').upsert(
        property_ids.map((property_id: string) => ({ user_id: invited.user!.id, property_id })),
        { onConflict: 'user_id,property_id' },
      )
      if (accessError) return json({ error: accessError.message }, 500)
    }

    return json({ id: invited.user.id, email })
  }

  if (body.action === 'delete-self') {
    const { count, error: countError } = await service
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('is_active', true)
    if (countError) return json({ error: countError.message }, 500)
    if ((count ?? 0) <= 1 && adminProfile.role === 'admin') return json({ error: 'The last administrator cannot delete their own account.' }, 400)

    await service.from('property_access').delete().eq('user_id', authData.user.id)
    await service.from('profiles').delete().eq('id', authData.user.id)
    const { error: deleteError } = await service.auth.admin.deleteUser(authData.user.id)
    if (deleteError) return json({ error: deleteError.message }, 400)
    return json({ id: authData.user.id })
  }

  if (body.action === 'delete') {
    const userId = String(body.user_id ?? '')
    if (!userId) return json({ error: 'User id is required' }, 400)
    if (userId === authData.user.id) return json({ error: 'You cannot delete yourself' }, 400)

    await service.from('property_access').delete().eq('user_id', userId)
    await service.from('profiles').delete().eq('id', userId)
    const { error: deleteError } = await service.auth.admin.deleteUser(userId)
    if (deleteError) return json({ error: deleteError.message }, 400)
    return json({ id: userId })
  }

  return json({ error: 'Unknown action' }, 400)
})
