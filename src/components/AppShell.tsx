import { canOpenPage, type UserRole } from '../lib/permissions'
import { NavLink } from 'react-router-dom'
import { CalendarDays, Grid2X2, Home, Plus, Settings } from 'lucide-react'
import { useT } from '../lib/i18n'

type AppShellProps = { children: React.ReactNode; role?: UserRole }

export function AppShell({ children, role = 'viewer' }: AppShellProps) {
  const t = useT()
  const navItems = [
    { to: '/', label: t('home'), icon: Home },
    { to: '/reservations', label: t('list'), icon: CalendarDays },
    { to: '/calendar', label: t('calendar'), icon: CalendarDays },
    { to: '/properties', label: t('properties'), icon: Grid2X2 },
    { to: '/new-booking', label: t('reservation'), icon: Plus, primary: true },
    { to: '/settings', label: t('settings'), icon: Settings },
  ]

  return <div className="app-shell min-h-screen bg-[#f6f1e9] text-slate-900">
    <main className="pb-20">{children}</main>
    <nav className="app-bottom-nav fixed bottom-0 left-0 right-0 z-40 border-t border-[#ddd6ca]/80 bg-[#fffdfa]/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-1 px-2 py-1.5 sm:justify-around sm:px-3">
        {navItems.filter(item => canOpenPage(role, item.to)).map(({ to, label, icon: Icon, primary }) => <NavLink key={to} to={to} end={to === '/'} title={label} className={({ isActive }) => ['flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl border px-1.5 py-1.5 text-[10px] font-semibold transition sm:max-w-28 sm:px-3 sm:py-2 sm:text-[11px]', primary ? 'border-violet-700 bg-violet-600 text-white' : isActive ? 'border-violet-200 bg-violet-100 text-violet-700' : 'border-transparent text-slate-500 hover:border-slate-200 hover:bg-white'].join(' ')}><Icon size={primary ? 22 : 18} strokeWidth={primary ? 2.8 : 1.8}/><span className="truncate">{label}</span></NavLink>)}
      </div>
    </nav>
  </div>
}
