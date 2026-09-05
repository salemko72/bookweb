import { useEffect, useState } from 'react'
import { getProperties, type Property } from '../lib/properties-repository'

export function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadProperties() {
      try {
        const data = await getProperties()

        if (!mounted) return

        setProperties(data)
        setError(null)
      } catch (err) {
        if (!mounted) return

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load properties',
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    void loadProperties()

    return () => {
      mounted = false
    }
  }, [])

  if (loading) {
    return (
      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <p className="text-sm text-slate-500">Loading properties...</p>
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

  if (properties.length === 0) {
    return (
      <section className="mx-auto max-w-6xl p-6 md:p-10">
        <header>
          <p className="text-sm text-slate-500">Your portfolio</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">
            Properties
          </h1>
        </header>

        <div className="mt-8 rounded-3xl bg-white p-8">
          <p className="text-lg font-medium text-slate-800">
            No properties yet
          </p>
          <p className="mt-2 text-slate-500">
            Add a property to start managing your portfolio.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-6xl p-6 md:p-10">
      <header>
        <p className="text-sm text-slate-500">Your portfolio</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Properties
        </h1>
      </header>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {properties.map((property) => (
          <article
            key={property.id}
            className="rounded-3xl bg-white p-6"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
              {property.name.charAt(0).toUpperCase()}
            </div>

            <h2 className="mt-5 text-2xl font-semibold">
              {property.name}
            </h2>

            <p className="mt-2 text-slate-500">
              {property.area_m2 != null ? `${property.area_m2} m²` : '—'}
              {' · capacity '}
              {property.capacity}
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-1">
                {property.rooms} rooms
              </span>

              {property.wifi && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Wi-Fi
                </span>
              )}

              {property.air_conditioning && (
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  AC
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
