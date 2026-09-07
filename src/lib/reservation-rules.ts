type ReservationLike = {
  id?: string
  property_id: string
  check_in: string
  check_out: string
  status: string
}

export function hasReservationConflict(
  existing: ReservationLike[],
  propertyId: string,
  checkIn: string,
  checkOut: string,
  excludeReservationId?: string,
): boolean {
  const requestedStart = new Date(checkIn).getTime()
  const requestedEnd = new Date(checkOut).getTime()

  return existing.some((reservation) => {
    if (
      excludeReservationId &&
      reservation.id === excludeReservationId
    ) {
      return false
    }

    if (reservation.property_id !== propertyId) {
      return false
    }

    if (reservation.status === 'cancelled') {
      return false
    }

    const existingStart = new Date(reservation.check_in).getTime()
    const existingEnd = new Date(reservation.check_out).getTime()

    return requestedStart < existingEnd && requestedEnd > existingStart
  })
}
