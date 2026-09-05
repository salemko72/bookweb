import { supabase } from './supabase'

export type Property = {
  id: string
  name: string
  capacity: number
  rooms: number
  area_m2: number | null
  check_in_time: string
  check_out_time: string
  cleaning_duration_minutes: number
  wifi: boolean
  air_conditioning: boolean
  is_active: boolean
}

export async function getProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) {
    throw error
  }

  return data ?? []
}
