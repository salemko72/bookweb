import { describe, expect, it } from 'vitest'
import {
  buildCalendarDays,
  getReservationPosition,
  layoutReservations,
  type CalendarReservation,
} from './lib/calendar-data'

describe('calendar data', () => {
  it('builds a continuous inclusive date range', () => {
    const days = buildCalendarDays('2026-09-01', '2026-09-05')

    expect(days).toEqual([
      '2026-09-01',
      '2026-09-02',
      '2026-09-03',
      '2026-09-04',
      '2026-09-05',
    ])
  })

  it('calculates reservation position on the timeline', () => {
    const reservation: CalendarReservation = {
      id: 'r1',
      property_id: 'p1',
      check_in: '2026-09-03T14:00:00+02:00',
      check_out: '2026-09-06T10:00:00+02:00',
      status: 'confirmed',
    }

    expect(
      getReservationPosition(
        reservation,
        '2026-09-01',
        '2026-09-10',
      ),
    ).toEqual({
      start: 2,
      end: 5,
      span: 3,
    })
  })

  it('ignores cancelled reservations', () => {
    const reservation: CalendarReservation = {
      id: 'r1',
      property_id: 'p1',
      check_in: '2026-09-03T14:00:00+02:00',
      check_out: '2026-09-06T10:00:00+02:00',
      status: 'cancelled',
    }

    expect(
      getReservationPosition(reservation, '2026-09-01', '2026-09-10'),
    ).toBeNull()
  })

  it('assigns overlapping reservations to separate lanes', () => {
    const reservations: CalendarReservation[] = [
      {
        id: 'r1',
        property_id: 'p1',
        check_in: '2026-09-01T14:00:00+02:00',
        check_out: '2026-09-05T10:00:00+02:00',
        status: 'confirmed',
      },
      {
        id: 'r2',
        property_id: 'p1',
        check_in: '2026-09-03T14:00:00+02:00',
        check_out: '2026-09-07T10:00:00+02:00',
        status: 'confirmed',
      },
      {
        id: 'r3',
        property_id: 'p1',
        check_in: '2026-09-07T14:00:00+02:00',
        check_out: '2026-09-09T10:00:00+02:00',
        status: 'confirmed',
      },
    ]

    expect(
      layoutReservations(reservations, '2026-09-01', '2026-09-10'),
    ).toEqual([
      { id: 'r1', lane: 0, start: 0, end: 4, span: 4 },
      { id: 'r2', lane: 1, start: 2, end: 6, span: 4 },
      { id: 'r3', lane: 0, start: 6, end: 8, span: 2 },
    ])
  })

  it('calculates a resized reservation range', () => {
    const reservation: CalendarReservation = {
      id: 'r1',
      property_id: 'p1',
      check_in: '2026-09-03T14:00:00+02:00',
      check_out: '2026-09-06T10:00:00+02:00',
      status: 'confirmed',
    }

    expect(
      getReservationPosition(
        {
          ...reservation,
          check_in: '2026-09-02T14:00:00+02:00',
          check_out: '2026-09-08T10:00:00+02:00',
        },
        '2026-09-01',
        '2026-09-10',
      ),
    ).toEqual({
      start: 1,
      end: 7,
      span: 6,
    })
  })
})
