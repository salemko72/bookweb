export function HomePage() {
  return (
    <section className="mx-auto max-w-6xl p-6 md:p-10">
      <header>
        <p className="text-sm text-slate-500">Friday, September 5</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Good morning, Kate
        </h1>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <SummaryCard label="Check-ins" value="0" />
        <SummaryCard label="Check-outs" value="0" />
        <SummaryCard label="Cleanings" value="0" />
      </div>

      <div className="mt-8 rounded-3xl bg-white p-8">
        <p className="text-lg font-medium">You're all clear.</p>
        <p className="mt-2 text-slate-500">
          No check-ins, check-outs or cleanings today.
        </p>
      </div>
    </section>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl bg-white p-6">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold">{value}</p>
    </div>
  )
}
