import { supabase } from './supabase'

export type ReservationStatus = 'tentative' | 'confirmed' | 'cancelled'
export type ReservationSource = 'airbnb' | 'booking' | 'direct' | 'agency'

export type Reservation = {
  guest_id?: string | null
  adults?: number
  children?: number
  arrival_time?: string | null
  special_request?: string | null
  nightly_rate?: number | null
  total_price?: number | null
  id: string
  property_id: string
  source: string
  guest_name: string
  check_in: string
  check_out: string
  guests: number
  status: string
  external_id?: string | null
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export type CreateReservationInput = {
  guest_id?: string | null
  adults?: number
  children?: number
  arrival_time?: string | null
  special_request?: string | null
  nightly_rate?: number | null
  property_id: string
  source: ReservationSource
  guest_name: string
  check_in: string
  check_out: string
  guests: number
  status: ReservationStatus
  notes?: string | null
  created_at?: string
  updated_at?: string
}

export type UpdateReservationInput = {
  guest_id?: string | null
  adults?: number
  children?: number
  arrival_time?: string | null
  special_request?: string | null
  nightly_rate?: number | null
  property_id: string
  guest_name: string
  check_in: string
  check_out: string
  guests: number
  source: ReservationSource
  status: ReservationStatus
  notes?: string | null
}

export async function getReservation(id: string): Promise<Reservation> {
  const { data, error } = await supabase.from('reservations').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateReservation(id: string, changes: UpdateReservationInput): Promise<Reservation> {
  const { data, error } = await supabase.from('reservations').update(changes).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getReservations(start: string, end: string): Promise<Reservation[]> {
  const { data, error } = await supabase.from('reservations').select('*')
    .gte('check_out', start).lt('check_in', end).order('check_in')
  if (error) throw error
  return data ?? []
}

export async function createReservation(reservation: CreateReservationInput): Promise<Reservation> {
  const { data, error } = await supabase.from('reservations').insert(reservation).select().single()
  if (error) throw error
  return data
}

export async function deleteReservation(id: string): Promise<void> {
  const { error } = await supabase.from('reservations').delete().eq('id', id)
  if (error) throw error
}

export async function updateReservationDates(id: string, checkIn: string, checkOut: string): Promise<Reservation> {
  const { data, error } = await supabase.from('reservations').update({ check_in: checkIn, check_out: checkOut }).eq('id', id).select().single()
  if (error) throw error
  return data
}
