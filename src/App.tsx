import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoginForm } from './components/LoginForm'
import { WelcomeIllustration } from './components/WelcomeIllustration'
import { CalendarPage } from './pages/CalendarPage'
import { EditReservationPage } from './pages/EditReservationPage'
import { HomePage } from './pages/HomePage'
import { NewBookingPage } from './pages/NewBookingPage'
import { PeoplePage } from './pages/PeoplePage'
import { PropertiesPage } from './pages/PropertiesPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdministrationPages } from './pages/AdministrationPages'
import { getCurrentSession } from './lib/auth-supabase'
import { useT } from './lib/i18n'

function LoginScreen({ onAuthenticated }: { onAuthenticated: () => void }) {
  const t = useT()
  return <main className="min-h-screen bg-[#f6f1e9] text-slate-900">
    <div className="mx-auto grid min-h-screen max-w-[1120px] items-center gap-5 px-4 py-4 sm:px-6 md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:py-6">
      <section className="hidden h-[calc(100vh-3rem)] max-h-[780px] overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#dff1fa] to-[#cfe8f4] md:flex md:flex-col md:justify-between md:p-7">
        <div><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700/70">PomaaaloStay</p><h1 className="mt-3 max-w-md text-[2.75rem] font-semibold leading-[1.03] tracking-tight text-[#183a69]">{t('bookingManagement')}</h1><p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">A calmer way to manage homes, bookings and daily operations.</p></div>
        <WelcomeIllustration />
      </section>
      <section className="flex items-center justify-center">
        <div className="w-full max-w-[420px] rounded-[1.75rem] border border-white/70 bg-white/96 p-5 shadow-[0_18px_60px_rgba(51,84,110,0.12)] backdrop-blur sm:p-7">
          <div className="text-center"><div className="flex items-center justify-center gap-2 text-[1.45rem] font-semibold tracking-tight text-[#183a69]"><span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-sky-50">⌂</span><span>Pomaaalo<span className="text-sky-500">Stay</span></span></div><p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-500">{t('bookingManagement')}</p><h2 className="mt-1.5 text-2xl font-semibold tracking-tight text-[#173764]">{t('welcomeBack')}</h2><p className="mt-1 text-sm text-slate-500">{t('signInToManage')}</p></div>
          <div className="my-4 h-px bg-slate-100" />
          <LoginForm onAuthenticated={onAuthenticated} />
        </div>
      </section>
    </div>
  </main>
}

function App() {
  const navigate = useNavigate()
  const [checkingSession, setCheckingSession] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)
  useEffect(() => { let mounted = true; getCurrentSession().then((session) => { if (!mounted) return; setAuthenticated(Boolean(session)); setCheckingSession(false) }); return () => { mounted = false } }, [])
  if (checkingSession) return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading...</main>
  if (!authenticated) return <LoginScreen onAuthenticated={() => { setAuthenticated(true); navigate('/') }} />
  return <AppShell><Routes><Route path="/" element={<HomePage onLogout={() => setAuthenticated(false)} />} /><Route path="/calendar" element={<CalendarPage />} /><Route path="/edit-reservation/:id" element={<EditReservationPage />} /><Route path="/properties" element={<PropertiesPage />} /><Route path="/new-booking" element={<NewBookingPage />} /><Route path="/settings" element={<SettingsPage />} /><Route path="/people" element={<PeoplePage />} /><Route path="/calendar-sources" element={<AdministrationPages mode="calendar-sources" />} /><Route path="/notifications" element={<AdministrationPages mode="notifications" />} /><Route path="/account" element={<AdministrationPages mode="account" />} /></Routes></AppShell>
}
export default App
