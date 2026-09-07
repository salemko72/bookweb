import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, EllipsisVertical, Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { buildCalendarDays, layoutReservations, type CalendarReservation } from '../lib/calendar-data'
import { getProperties, type Property } from '../lib/properties-repository'
import { getReservations, updateReservationDates, type Reservation } from '../lib/reservations-repository'
import { hasReservationConflict } from '../lib/reservation-rules'
import { getReadableTextColor, getReservationBarColor, getReservationSourceBadge, normalizeSource } from '../lib/calendar-style'
import { formatDate, formatDateRange } from '../lib/date-format'
import { useT } from '../lib/i18n'

type TimelineReservation = CalendarReservation & { guest_name: string; guests: number; source: string }
type PendingResize = { id: string; previousCheckIn: string; previousCheckOut: string; nextCheckIn: string; nextCheckOut: string }

const DAY_WIDTH_BASE = 51
const ROW_LABEL_WIDTH = 84
const LANE_HEIGHT = 40
const BAR_HEIGHT = 32
const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5] as const

const fallbackImages: Record<string, string> = {
  Priko: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=120&h=120&fit=crop',
  Nelly: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=120&h=120&fit=crop',
  Pjaca: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=120&h=120&fit=crop',
}

function toDateString(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function addDaysToString(value: string, days: number) { const date = new Date(`${value}T12:00:00`); date.setDate(date.getDate() + days); return toDateString(date) }
function formatDay(value: string) { return new Intl.DateTimeFormat('en-GB', { weekday: 'short' }).format(new Date(`${value}T12:00:00`)) }
function monthLabel(value: string) { return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(`${value}T12:00:00`)) }
function formatTimelineDateRange(start: string, end: string) {
  const startDate = formatDate(start)
  const endDate = formatDate(end)
  return `${startDate.slice(0, 6)} - ${endDate}`
}

export function CalendarPage() {
  const t = useT()
  const navigate = useNavigate()
  const [properties, setProperties] = useState<Property[]>([])
  const [reservations, setReservations] = useState<TimelineReservation[]>([])
  const [rangeStart, setRangeStart] = useState('2026-09-01')
  const [rangeDays, setRangeDays] = useState(45)
  const [resizeMessage, setResizeMessage] = useState<string | null>(null)
  const [savingReservationId, setSavingReservationId] = useState<string | null>(null)
  const [zoom, setZoom] = useState<(typeof ZOOMS)[number]>(1)
  const [fitMode, setFitMode] = useState(false)
  const [fitDayWidth, setFitDayWidth] = useState(32)
  const [resizing, setResizing] = useState<{ id: string; side: 'start' | 'end'; initialX: number; initialCheckIn: string; initialCheckOut: string } | null>(null)
  const [pendingResize, setPendingResize] = useState<PendingResize | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const rangeEnd = useMemo(() => addDaysToString(rangeStart, rangeDays - 1), [rangeStart, rangeDays])
  const days = useMemo(() => buildCalendarDays(rangeStart, rangeEnd), [rangeStart, rangeEnd])
  const dayWidth = fitMode ? fitDayWidth : DAY_WIDTH_BASE * zoom

  useEffect(() => {
    let mounted = true
    Promise.all([getProperties(), getReservations(`${rangeStart}T00:00:00`, `${rangeEnd}T23:59:59.999`)]).then(([propertyData, reservationData]) => {
      if (!mounted) return
      setProperties(propertyData)
      setReservations(reservationData.map((reservation: Reservation) => ({ id: reservation.id, property_id: reservation.property_id, check_in: reservation.check_in, check_out: reservation.check_out, status: reservation.status, guest_name: reservation.guest_name, guests: reservation.guests, source: reservation.source })))
    }).catch(() => { if (mounted) { setProperties([]); setReservations([]) } })
    return () => { mounted = false }
  }, [rangeStart, rangeEnd])

  useEffect(() => {
    if (!fitMode) return
    const recalc = () => {
      const width = timelineRef.current?.clientWidth ?? window.innerWidth
      const available = Math.max(360, width - ROW_LABEL_WIDTH - 12)
      setFitDayWidth(Math.max(22, Math.floor(available / 90)))
    }
    recalc(); window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [fitMode])

  useEffect(() => {
    if (!resizing) return
    const handlePointerMove = (event: PointerEvent) => {
      const deltaDays = Math.round((event.clientX - resizing.initialX) / dayWidth)
      if (!deltaDays) return
      if (resizing.side === 'start') {
        const nextIn = new Date(resizing.initialCheckIn); nextIn.setDate(nextIn.getDate() + deltaDays)
        if (nextIn >= new Date(resizing.initialCheckOut)) return
        setReservations((items) => items.map((item) => item.id === resizing.id ? { ...item, check_in: nextIn.toISOString() } : item))
      } else {
        const nextOut = new Date(resizing.initialCheckOut); nextOut.setDate(nextOut.getDate() + deltaDays)
        if (nextOut <= new Date(resizing.initialCheckIn)) return
        setReservations((items) => items.map((item) => item.id === resizing.id ? { ...item, check_out: nextOut.toISOString() } : item))
      }
    }
    const handlePointerUp = () => {
      const resize = resizing
      const reservation = reservations.find((item) => item.id === resize.id)
      setResizing(null)
      if (!reservation) return
      const changed = reservation.check_in !== resize.initialCheckIn || reservation.check_out !== resize.initialCheckOut
      if (!changed) return
      if (hasReservationConflict(reservations, reservation.property_id, reservation.check_in, reservation.check_out, reservation.id)) {
        setReservations((items) => items.map((item) => item.id === resize.id ? { ...item, check_in: resize.initialCheckIn, check_out: resize.initialCheckOut } : item))
        setResizeMessage('This reservation overlaps another booking.')
        return
      }
      setResizeMessage(null)
      setPendingResize({ id: reservation.id, previousCheckIn: resize.initialCheckIn, previousCheckOut: resize.initialCheckOut, nextCheckIn: reservation.check_in, nextCheckOut: reservation.check_out })
    }
    window.addEventListener('pointermove', handlePointerMove); window.addEventListener('pointerup', handlePointerUp)
    return () => { window.removeEventListener('pointermove', handlePointerMove); window.removeEventListener('pointerup', handlePointerUp) }
  }, [dayWidth, resizing, reservations])

  const confirmResize = async () => {
    if (!pendingResize) return
    const pending = pendingResize
    setPendingResize(null)
    setSavingReservationId(pending.id)
    setResizeMessage(null)
    try {
      const saved = await updateReservationDates(pending.id, pending.nextCheckIn, pending.nextCheckOut)
      setReservations((items) => items.map((item) => item.id === pending.id ? { ...item, check_in: saved.check_in, check_out: saved.check_out } : item))
    } catch {
      setReservations((items) => items.map((item) => item.id === pending.id ? { ...item, check_in: pending.previousCheckIn, check_out: pending.previousCheckOut } : item))
      setResizeMessage('Could not save the new reservation dates. Changes were reverted.')
    } finally { setSavingReservationId(null) }
  }

  const cancelResize = () => {
    if (!pendingResize) return
    const pending = pendingResize
    setPendingResize(null)
    setReservations((items) => items.map((item) => item.id === pending.id ? { ...item, check_in: pending.previousCheckIn, check_out: pending.previousCheckOut } : item))
  }
  const moveRange = (daysToMove: number) => setRangeStart(addDaysToString(rangeStart, daysToMove))
  const toggleFit = () => setFitMode((current) => { const next = !current; setRangeDays(next ? 90 : 45); return next })
  const setManualZoom = (value: (typeof ZOOMS)[number]) => { setFitMode(false); setRangeDays(45); setZoom(value) }
  const today = toDateString(new Date())

  return <section className="mx-auto max-w-[1600px] p-3 pb-8 md:p-5">
    {resizeMessage && <div role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{resizeMessage}</div>}
    {pendingResize && <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/25 p-4 backdrop-blur-[2px]"><div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.2)]"><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">Confirm date change</p><h2 className="mt-2 text-xl font-semibold tracking-tight">Are you sure?</h2><p className="mt-2 text-sm text-slate-600">Change this reservation to <strong>{formatDateRange(pendingResize.nextCheckIn, pendingResize.nextCheckOut)}</strong>?</p><div className="mt-5 flex gap-2"><button type="button" onClick={cancelResize} className="flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-semibold text-slate-700">Cancel</button><button type="button" onClick={() => void confirmResize()} className="flex-1 rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">Confirm change</button></div></div></div>}
    <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div><p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-500">{t('availability')}</p><h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{t('calendar')}</h1><p className="mt-1 text-xs text-slate-500">{t('continuousTimeline')}</p></div>
      <div className="flex flex-wrap items-center gap-1.5">
        <div data-testid="calendar-zoom" className="flex items-center rounded-xl border border-[#ded7cd] bg-white p-1"><span className="hidden px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:block">{t('zoom')}</span><button type="button" aria-label="Zoom out" disabled={fitMode} onClick={() => setManualZoom(ZOOMS[Math.max(0, ZOOMS.indexOf(zoom) - 1)])} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><Minus size={14}/></button><span className="min-w-10 text-center text-[11px] font-semibold text-slate-600">{Math.round(zoom * 100)}%</span><button type="button" aria-label="Zoom in" disabled={fitMode} onClick={() => setManualZoom(ZOOMS[Math.min(ZOOMS.length - 1, ZOOMS.indexOf(zoom) + 1)])} className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-40"><Plus size={14}/></button></div>
        <button type="button" aria-label={fitMode ? 'FIT on' : 'FIT off'} aria-pressed={fitMode} onClick={toggleFit} className="flex h-6 w-11 items-center rounded-full border border-slate-300 bg-slate-100 p-0.5 shadow-inner transition-colors aria-pressed:border-violet-300 aria-pressed:bg-violet-100" title="Show a 3-month fitted timeline"><span className={['h-5 w-5 rounded-full bg-white shadow-sm transition-transform', fitMode ? 'translate-x-5' : 'translate-x-0'].join('')} /></button>
        <span data-testid="calendar-fit-label" className="w-12 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">FIT {fitMode ? 'ON' : 'OFF'}</span>
        <button type="button" aria-label="Previous period" onClick={() => moveRange(-14)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><ChevronLeft size={16}/></button>
        <div className="min-w-32 rounded-xl border border-slate-200 bg-white px-3 py-2 text-center text-[11px] font-semibold text-slate-700">{monthLabel(rangeStart)}</div>
        <button type="button" aria-label="Next period" onClick={() => moveRange(14)} className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-50"><ChevronRight size={16}/></button>
      </div>
    </div>

    <div ref={timelineRef} data-testid="calendar-timeline" className="overflow-x-auto rounded-[1.35rem] border border-[#ded7cd] bg-white">
      <div className="relative min-w-max" style={{ width: ROW_LABEL_WIDTH + days.length * dayWidth }}>
        <div className="sticky top-0 z-20 flex border-b border-slate-200 bg-white"><div className="sticky left-0 z-30 flex shrink-0 items-center border-r border-slate-200 bg-white px-2 text-[10px] font-semibold text-slate-600" style={{width:ROW_LABEL_WIDTH}}>Properties</div><div className="flex">{days.map(day => <div key={day} data-testid={`calendar-day-${day}`} className={['flex h-12 shrink-0 flex-col justify-center border-r border-slate-100 px-1 text-center', day === today ? 'bg-violet-50' : ''].join(' ')} style={{width:dayWidth}}><span className="text-[8px] font-semibold uppercase text-slate-400">{formatDay(day)}</span><span className={['mt-0.5 text-[11px] font-semibold', day === today ? 'text-violet-700' : 'text-slate-700'].join(' ')}>{day.slice(8)}</span></div>)}</div></div>
        {properties.map(property => {
          const propertyReservations = reservations.filter(r => r.property_id === property.id)
          const layout = layoutReservations(propertyReservations, rangeStart, rangeEnd)
          const laneCount = Math.max(1, ...layout.map(item => item.lane + 1))
          const image = property.image_url || fallbackImages[property.name]
          return <div key={property.id} data-testid="calendar-property-row" className="flex border-b border-slate-100" style={{minHeight:laneCount * LANE_HEIGHT + 15}}>
            <div className="sticky left-0 z-10 shrink-0 border-r border-slate-200 bg-white px-1.5 py-2.5" style={{width:ROW_LABEL_WIDTH}}><div className="flex items-center gap-1.5"><div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-slate-100 ring-1 ring-slate-200">{image ? <img src={image} alt="" className="h-full w-full object-cover"/> : null}</div><div className="min-w-0"><p className="truncate text-[9px] font-semibold text-slate-800" title={property.name}>{property.name}</p><span className="mt-0.5 inline-flex h-1.5 w-6 rounded-full" style={{backgroundColor: property.color || '#7C5CFC'}} /></div></div></div>
            <div className="relative" style={{width:days.length * dayWidth}}>
              <div className="pointer-events-none absolute inset-0 flex">{days.map(day => <div key={day} className="h-full border-r border-slate-100" style={{width:dayWidth}} />)}</div>
              {layout.map(position => {
                const reservation = propertyReservations.find(item => item.id === position.id)
                if (!reservation) return null
                const left = position.start * dayWidth + 3
                const width = Math.max(dayWidth - 6, position.span * dayWidth - 6)
                const source = normalizeSource(reservation.source)
                const imported = source === 'airbnb' || source === 'booking'
                const bg = getReservationBarColor(source)
                const text = getReadableTextColor(bg)
                const badge = getReservationSourceBadge(reservation.source)
                return <div key={reservation.id} data-testid={`reservation-lane-${position.lane}`} className="absolute flex items-stretch overflow-hidden rounded-xl" style={{left, top:position.lane * LANE_HEIGHT + 4, width, height:BAR_HEIGHT}}>
                  <button type="button" disabled={imported || savingReservationId === reservation.id} title={imported ? 'Imported reservation — dates are read-only' : 'Resize reservation start'} aria-label="Resize reservation start" aria-busy={savingReservationId === reservation.id} onPointerDown={(e) => { e.stopPropagation(); if (imported) return; setResizeMessage(null); setResizing({id:reservation.id, side:'start', initialX:e.clientX, initialCheckIn:reservation.check_in, initialCheckOut:reservation.check_out}) }} data-testid="reservation-resize-start" className={['z-20 flex w-4 shrink-0 items-center justify-center', imported ? 'cursor-default opacity-65' : 'cursor-ew-resize'].join(' ')} style={{backgroundColor:bg}}><EllipsisVertical size={12} strokeWidth={2.3} color={text}/></button>
                  <div onDoubleClick={() => navigate(`/edit-reservation/${reservation.id}`)} data-testid={`reservation-body-${reservation.id}`} className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 overflow-hidden px-1.5" style={{height:BAR_HEIGHT, backgroundImage:`linear-gradient(135deg, ${bg} 0%, ${bg}CC 100%)`, color:text}} title={`${reservation.guest_name} · ${formatDateRange(reservation.check_in, reservation.check_out)}`}>
                    <div className="h-6 w-6 shrink-0 overflow-hidden rounded-full border border-white/70 bg-white/20">{image ? <img data-testid={`reservation-property-image-${reservation.id}`} src={image} alt="" className="h-full w-full object-cover"/> : null}</div>
                    <span data-testid={`reservation-source-badge-${reservation.id}`} title={badge.name} className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/20 text-[9px] font-bold">{badge.label}</span>
                    <div className="min-w-0 flex-1 overflow-hidden"><p className="truncate text-[12px] font-bold leading-none tracking-[-0.01em]">{reservation.guest_name}</p><p className="mt-1 truncate text-[7px] font-medium leading-none opacity-90">{formatTimelineDateRange(reservation.check_in, reservation.check_out)}</p></div>
                  </div>
                  <button type="button" disabled={imported || savingReservationId === reservation.id} title={imported ? 'Imported reservation — dates are read-only' : 'Resize reservation end'} aria-label="Resize reservation end" onPointerDown={(e) => { e.stopPropagation(); if (imported) return; setResizeMessage(null); setResizing({id:reservation.id, side:'end', initialX:e.clientX, initialCheckIn:reservation.check_in, initialCheckOut:reservation.check_out}) }} data-testid="reservation-resize-end" className={['z-20 flex w-4 shrink-0 items-center justify-center', imported ? 'cursor-default opacity-65' : 'cursor-ew-resize'].join(' ')} style={{backgroundColor:bg}}><EllipsisVertical size={12} strokeWidth={2.3} color={text}/></button>
                </div>
              })}
            </div>
          </div>
        })}
      </div>
    </div>
    <p className="mt-2 text-[10px] text-slate-400">100% keeps the current dense timeline. FIT shows 3 months. Double-click a reservation to edit it.</p>
  </section>
}
