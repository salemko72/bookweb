import { supabase } from './supabase'
import type { UserProfile, UserRole } from './permissions'

export async function getProfiles(): Promise<UserProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .order('full_name', { ascending: true, nullsFirst: false })
  if (error) throw error
  return data ?? []
}


export async function getProfile(id: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,email,full_name,role,is_active')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateProfile(
  id: string,
  changes: Partial<Pick<UserProfile, 'full_name' | 'role' | 'is_active'>>,
): Promise<UserProfile> {
  const { data, error } = await supabase
    .from('profiles')
    .update(changes)
    .eq('id', id)
    .select('id,email,full_name,role,is_active')
    .single()
  if (error) throw error
  return data
}

export async function getPropertyAccess(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('property_access')
    .select('property_id')
    .eq('user_id', userId)
  if (error) throw error
  return (data ?? []).map((row) => row.property_id)
}

export async function replacePropertyAccess(userId: string, propertyIds: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('property_access')
    .delete()
    .eq('user_id', userId)
  if (deleteError) throw deleteError

  if (!propertyIds.length) return

  const { error: insertError } = await supabase
    .from('property_access')
    .insert(propertyIds.map((property_id) => ({ user_id: userId, property_id })))
  if (insertError) throw insertError
}

export async function setProfileRole(id: string, role: UserRole): Promise<UserProfile> {
  return updateProfile(id, { role })
}
