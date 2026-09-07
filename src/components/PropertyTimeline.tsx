import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { buildCalendarDays, layoutReservations, type CalendarReservation } from '../lib/calendar-data'
import { formatDateRange } from '../lib/date-format'
import { getReadableTextColor, getReservationBarColor, normalizeSource } from '../lib/calendar-style'
import type { Reservation } from '../lib/reservations-repository'
import type { Property } from '../lib/properties-repository'

type Props = { property: Property; reservations: Reservation[] }

function toDateString(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` }
function todayString() { return toDateString(new Date()) }
function addDays(value: string, days: number) { const d = new Date(`${value}T12:00:00`); d.setDate(d.getDate()+days); return toDateString(d) }
function sourceLabel(source: string) { const s = normalizeSource(source); return s === 'airbnb' ? 'AIRBNB' : s === 'booking' ? 'BOOKING' : s === 'agency' ? 'AGENCY' : 'DIRECT' }

export function PropertyTimeline({ property, reservations }: Props) {
  const navigate = useNavigate()
  const start = todayString()
  const end = addDays(start, 89)
  const days = useMemo(() => buildCalendarDays(start, end), [start, end])
  const visible = reservations.filter((item) => item.property_id === property.id)
  const layout = layoutReservations(visible as CalendarReservation[], start, end)
  const dayWidth = 12
  const width = days.length * dayWidth

  return <section className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3" data-testid="property-mini-timeline">
    <div className="flex items-center justify-between gap-2"><div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-violet-500">Availability</p><h3 className="mt-0.5 text-sm font-semibold text-slate-800">Next 3 months</h3></div><span className="text-[10px] text-slate-400">Scroll horizontally</span></div>
    <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 bg-white"><div className="relative min-w-max" style={{width}}>
      <div className="flex border-b border-slate-100">{days.map((day)=><div key={day} className="h-6 border-r border-slate-100" style={{width:dayWidth}} title={day}/>)}</div>
      <div className="relative h-20">{days.map(day=><div key={day} className="absolute top-0 h-full border-r border-slate-100" style={{left:days.indexOf(day)*dayWidth,width:dayWidth}}/>)}
        {layout.map(position=>{const item=visible.find(r=>r.id===position.id);if(!item)return null;const bg=getReservationBarColor(item.source);const text=getReadableTextColor(bg);const left=position.start*dayWidth+2;const barWidth=Math.max(dayWidth-4,position.span*dayWidth-4);return <button key={item.id} type="button" onDoubleClick={()=>navigate(`/edit-reservation/${item.id}`)} title={`${item.guest_name} · ${formatDateRange(item.check_in,item.check_out)}`} className="absolute flex items-center overflow-hidden rounded-full text-left" style={{left,top:8+position.lane*28,width:barWidth,height:22,backgroundColor:bg,color:text}}><span className="ml-1.5 truncate px-1 text-[8px] font-semibold">{sourceLabel(item.source)} · {item.guest_name}</span></button>})}
      </div>
    </div></div>
    <div className="mt-2 flex items-center justify-between text-[9px] text-slate-400"><span>{start}</span><span>{end}</span></div>
  </section>
}
