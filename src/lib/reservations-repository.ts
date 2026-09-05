import { supabase } from './supabase'

export type ReservationStatus = 'tentative' | 'confirmed' | 'cancelled'
export type ReservationSource = 'airbnb' | 'booking' | 'direct' | 'agency'

export type Reservation = {
  id: string
  property_id: string
  source: string
  guest_name: string
  check_in: string
  check_out: string
  guests: number
  status: string
  external_id?: string | null
  created_at?: string
  updated_at?: string
}

export type CreateReservationInput = {
  property_id: string
  source: ReservationSource
  guest_name: string
  check_in: string
  check_out: string
  guests: number
  status: ReservationStatus
}

export async function getReservations(
  start: string,
  end: string,
): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .gte('check_out', start)
    .lt('check_in', end)
    .order('check_in')

  if (error) {
    throw error
  }

  return data ?? []
}

export async function createReservation(
  reservation: CreateReservationInput,
): Promise<Reservation> {
  const { data, error } = await supabase
    .from('reservations')
    .insert(reservation)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}
