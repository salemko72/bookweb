import { NavLink } from 'react-router-dom'
import {
  CalendarDays,
  Grid2X2,
  Plus,
  Settings,
} from 'lucide-react'

type AppShellProps = {
  children: React.ReactNode
}

const navItems = [
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/properties', label: 'Properties', icon: Grid2X2 },
  { to: '/new-booking', label: 'New Booking', icon: Plus, primary: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="pb-24">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-around px-3 py-3">
          {navItems.map(({ to, label, icon: Icon, primary }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'flex min-w-20 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-medium transition',
                  primary
                    ? 'bg-violet-600 text-white'
                    : isActive
                      ? 'bg-violet-100 text-violet-700'
                      : 'text-slate-500 hover:bg-slate-100',
                ].join(' ')
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
