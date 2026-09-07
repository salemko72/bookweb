import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, FileText, Trash2, UserRound, X } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { DatePicker } from '../components/DatePicker'
import { getProperties, type Property } from '../lib/properties-repository'
import { deleteReservation, getReservation, getReservations, updateReservation, type Reservation } from '../lib/reservations-repository'
import { findBookingConflict } from '../lib/reservation-form'
import { formatDateInput, formatDateRange } from '../lib/date-format'
import { useT } from '../lib/i18n'

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function EditReservationPage() {
  const t = useT()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [selectedPropertyId, setSelectedPropertyId] = useState('')
  const [checkIn, setCheckIn] = useState(todayString())
  const [checkOut, setCheckOut] = useState(todayString())
  const [guestName, setGuestName] = useState('')
  const [guests, setGuests] = useState(1)
  const [source, setSource] = useState<'direct' | 'agency'>('direct')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    let mounted = true
    if (!id) return
    Promise.all([getReservation(id), getProperties()]).then(([item, propertyData]) => {
      if (!mounted) return
      setReservation(item)
      setProperties(propertyData)
      setSelectedPropertyId(item.property_id)
      setCheckIn(item.check_in.slice(0, 10))
      setCheckOut(item.check_out.slice(0, 10))
      setGuestName(item.guest_name)
      setGuests(item.guests)
      setSource(item.source === 'agency' ? 'agency' : 'direct')
      setNotes(item.notes ?? '')
    }).catch(() => {
      if (mounted) setError('Unable to load reservation.')
    }).finally(() => {
      if (mounted) setLoading(false)
    })
    return () => { mounted = false }
  }, [id])

  const property = useMemo(() => properties.find((item) => item.id === selectedPropertyId), [properties, selectedPropertyId])
  const imported = reservation?.source === 'airbnb' || reservation?.source === 'booking'

  async function save() {
    if (!reservation || !property || !selectedPropertyId) return
    setError(null); setMessage(null)
    if (!guestName.trim()) { setError('Enter the guest name.'); return }
    if (checkOut <= checkIn) { setError('Check-out must be after check-in.'); return }
    if (guests < 1 || guests > property.capacity) { setError(`This property allows up to ${property.capacity} guests.`); return }

    setSaving(true)
    try {
      const current = await getReservations(`${checkIn}T00:00:00`, `${checkOut}T23:59:59.999`)
      const values = { propertyId: selectedPropertyId, checkIn, checkOut, guestName, guests, source, notes }
      if (findBookingConflict(current.filter((item) => item.id !== reservation.id), values)) {
        setError('These dates overlap another booking.')
        return
      }
      const saved = await updateReservation(reservation.id, {
        property_id: selectedPropertyId,
        guest_name: guestName.trim(),
        check_in: new Date(`${checkIn}T${property.check_in_time.slice(0, 5)}:00`).toISOString(),
        check_out: new Date(`${checkOut}T${property.check_out_time.slice(0, 5)}:00`).toISOString(),
        guests,
        source: imported ? (reservation.source as 'airbnb' | 'booking') : source,
        status: reservation.status as 'tentative' | 'confirmed' | 'cancelled',
        notes: notes.trim() || null,
      })
      setReservation(saved)
      setMessage('Reservation updated.')
    } catch {
      setError('Unable to save reservation.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!reservation) return
    if (!window.confirm(`Delete reservation for ${reservation.guest_name}?`)) return
    setDeleting(true)
    setError(null)
    try {
      await deleteReservation(reservation.id)
      navigate('/calendar')
    } catch {
      setError('Unable to delete reservation.')
    } finally {
      setDeleting(false)
    }
  }

  if (loading) return <section className="mx-auto max-w-3xl p-4 md:p-5"><p className="text-xs text-slate-500">Loading...</p></section>
  if (!reservation) return <section className="mx-auto max-w-3xl p-4 md:p-5"><div role="alert" className="rounded-xl bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error || 'Reservation not found.'}</div></section>

  return <section className="mx-auto max-w-3xl p-3 pb-8 md:p-5">
    <header className="mb-4 flex items-start justify-between gap-3">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">Reservations</p><h1 className="mt-1 text-3xl font-semibold sm:text-4xl tracking-tight">Edit reservation</h1><p className="mt-1 text-xs text-slate-500">{formatDateRange(reservation.check_in, reservation.check_out)}</p></div>
      <button type="button" aria-label="Close" onClick={() => navigate('/calendar')} className="rounded-xl p-2 text-slate-400 hover:bg-white"><X size={18}/></button>
    </header>

    {error && <div role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{error}</div>}
    {message && <div role="status" className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">{message}</div>}

    <section className="rounded-[1.35rem] bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold"><CalendarDays size={17} className="text-violet-500"/>Stay</div>
      <label className="mt-3 block text-[11px] font-semibold text-slate-600">Property
        <select aria-label="Property" value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal">
          {properties.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </select>
      </label>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-[11px] font-semibold text-slate-600">Check-in{imported ? <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-500">{formatDateInput(checkIn)}</div> : <DatePicker label="Check-in" value={checkIn} onChange={setCheckIn}/>}</label>
        <label className="text-[11px] font-semibold text-slate-600">Check-out{imported ? <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-500">{formatDateInput(checkOut)}</div> : <DatePicker label="Check-out" value={checkOut} onChange={setCheckOut}/>}</label>
      </div>
    </section>

    <section className="mt-3 rounded-[1.35rem] bg-white p-4">
      <div className="flex items-center gap-2 text-sm font-semibold"><UserRound size={17} className="text-violet-500"/>Guest</div>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="text-[11px] font-semibold text-slate-600 md:col-span-2">Guest name<input value={guestName} onChange={(e) => setGuestName(e.target.value)} disabled={imported} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal disabled:bg-slate-50 disabled:text-slate-400"/></label>
        <label className="text-[11px] font-semibold text-slate-600">Guests<input type="number" min={1} max={property?.capacity} value={guests} onChange={(e) => setGuests(Number(e.target.value))} disabled={imported} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal disabled:bg-slate-50 disabled:text-slate-400"/></label>
        <label className="text-[11px] font-semibold text-slate-600">Source<select value={source} onChange={(e) => setSource(e.target.value as 'direct'|'agency')} disabled={imported} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-normal disabled:bg-slate-50 disabled:text-slate-400"><option value="direct">Direct / Manual</option><option value="agency">Agency</option></select></label>
      </div>
    </section>

    <section className="mt-3 rounded-[1.35rem] bg-white p-4"><div className="flex items-center gap-2 text-sm font-semibold"><FileText size={17} className="text-violet-500"/>{t('notes')}</div><textarea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400"/></section>

    {imported && <p className="mt-2 text-[10px] text-slate-400">Imported {reservation.source === 'airbnb' ? 'Airbnb' : 'Booking.com'} reservations keep their source and guest fields read-only.</p>}

    <div className="mt-3 flex gap-2"><button type="button" disabled={saving||deleting} onClick={()=>void save()} className="flex-1 rounded-xl bg-violet-600 px-4 py-3 text-xs font-semibold text-white disabled:opacity-60">{saving?'Saving…':'Save changes'}</button>{!imported && <button type="button" disabled={saving||deleting} onClick={()=>void remove()} className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-600 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"><Trash2 size={15}/></button>}</div>
  </section>
}
