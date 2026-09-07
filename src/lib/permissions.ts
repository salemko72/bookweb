export type UserRole = 'admin' | 'manager' | 'viewer' | 'cleaning'

export type UserProfile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
}

export function canManageUsers(role: UserRole): boolean {
  return role === 'admin'
}

export function canEditProperty(role: UserRole): boolean {
  return role === 'admin' || role === 'manager'
}

export function canEditReservation(role: UserRole): boolean {
  return role === 'admin' || role === 'manager'
}

export function canViewGuestDetails(role: UserRole): boolean {
  return role !== 'cleaning'
}

export function canManagePropertyAccess(role: UserRole): boolean {
  return role === 'admin'
}
