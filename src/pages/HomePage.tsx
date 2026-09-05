import { useEffect, useState } from 'react'
import {
  buildDailyOperationalSummary,
  type DailyOperationalSummary,
} from '../lib/operational-data'
import { getDailyOperationalData } from '../lib/operational-repository'
import { getProperties, type Property } from '../lib/properties-repository'

const emptySummary: DailyOperationalSummary = {
  checkIns: [],
  checkOuts: [],
  cleanings: [],
}

export function HomePage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [summary, setSummary] = useState<DailyOperationalSummary>(emptySummary)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const now = new Date()
        const today = now.toISOString().slice(0, 10)
        const start = `${today}T00:00:00`
        const end = `${today}T23:59:59.999`

        const [operational, propertyData] = await Promise.all([
          getDailyOperationalData(start, end),
          getProperties(),
        ])

        if (!mounted) return

        setProperties(propertyData)
        setSummary(
          buildDailyOperationalSummary(
            operational.reservations,
            operational.cleanings,
            today,
          ),
        )
      } catch (err) {
        if (!mounted) return
        setError(
          err instanceof Error ? err.message : 'Unable to load today’s data',
        )
      } finally {
        if (mounted) setLoading(false)
      }
    }

    void load()

    return () => {
      mounted = false
    }
  }, [])

  const propertyName = (propertyId: string) =>
    properties.find((property) => property.id === propertyId)?.name ?? 'Property'

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <p className="text-sm text-slate-500">Loading today...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <p className="text-sm text-red-600">{error}</p>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl p-6 md:p-10">
      <header>
        <p className="text-sm text-slate-500">Good morning, Kate</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Today</h1>
        <p className="mt-2 text-slate-500">
          {new Intl.DateTimeFormat('en-GB').format(new Date())}
        </p>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          ['Check-ins', summary.checkIns.length],
          ['Check-outs', summary.checkOuts.length],
          ['Cleanings', summary.cleanings.length],
        ].map(([label, count]) => (
          <div key={label} className="rounded-3xl bg-white p-6">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-4xl font-semibold">{count}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {summary.checkIns.map((reservation) => (
          <article key={`in-${reservation.id}`} className="rounded-3xl bg-white p-5">
            <p className="text-sm text-slate-500">Check-in</p>
            <h2 className="mt-1 text-xl font-semibold">
              {propertyName(reservation.property_id)}
            </h2>
            <p className="mt-1 text-slate-500">
              {reservation.guest_name} · {reservation.guests} guests
            </p>
          </article>
        ))}

        {summary.checkOuts.map((reservation) => (
          <article key={`out-${reservation.id}`} className="rounded-3xl bg-white p-5">
            <p className="text-sm text-slate-500">Check-out</p>
            <h2 className="mt-1 text-xl font-semibold">
              {propertyName(reservation.property_id)}
            </h2>
            <p className="mt-1 text-slate-500">
              {reservation.guest_name} · {reservation.guests} guests
            </p>
          </article>
        ))}

        {summary.cleanings.map((cleaning) => (
          <article key={`clean-${cleaning.id}`} className="rounded-3xl bg-white p-5">
            <p className="text-sm text-slate-500">Cleaning</p>
            <h2 className="mt-1 text-xl font-semibold">
              {propertyName(cleaning.property_id)}
            </h2>
            <p className="mt-1 text-slate-500">
              {new Date(cleaning.start_time).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' · '}
              {cleaning.status}
            </p>
          </article>
        ))}

        {summary.checkIns.length === 0 &&
          summary.checkOuts.length === 0 &&
          summary.cleanings.length === 0 && (
            <div className="rounded-3xl bg-white p-8">
              <p className="text-lg font-medium text-slate-800">
                You're all clear.
              </p>
              <p className="mt-2 text-slate-500">
                No check-ins, check-outs or cleanings today.
              </p>
            </div>
          )}
      </div>
    </section>
  )
}
