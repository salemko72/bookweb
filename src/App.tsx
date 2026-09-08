import { useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoginForm } from './components/LoginForm'
import { WelcomeIllustration } from './components/WelcomeIllustration'
import { CalendarPage } from './pages/CalendarPage'
import { BackupPage } from './pages/BackupPage'
import { EditReservationPage } from './pages/EditReservationPage'
import { HomePage } from './pages/HomePage'
import { NewBookingPage } from './pages/NewBookingPage'
import { PeoplePage } from './pages/PeoplePage'
import { PropertiesPage } from './pages/PropertiesPage'
import { SettingsPage } from './pages/SettingsPage'
import { AdministrationPages } from './pages/AdministrationPages'
import { getCurrentSession, signOut } from './lib/auth-supabase'
import { getProfile } from './lib/profiles-repository'
import { canOpenPage, type UserProfile } from './lib/permissions'
import { CleaningPage } from './pages/CleaningPage'
import { useT } from './lib/i18n'
import { OperationsPage } from './pages/OperationsPage'

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
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [accessError, setAccessError] = useState(false)
  const [revision, setRevision] = useState(0)
  useEffect(() => {
    let mounted = true
    let generation = 0
    async function refresh() {
      const current = ++generation
      try {
        const session = await getCurrentSession()
        const next = session?.user?.id ? await getProfile(session.user.id) : null
        if (!mounted || current !== generation) return
        setAuthenticated(Boolean(session))
        const valid = next?.is_active === true && ['admin', 'manager', 'viewer', 'cleaning'].includes(next.role)
        setProfile(valid ? next : null)
        setAccessError(Boolean(session) && !valid)
      } catch {
        if (mounted && current === generation) { setProfile(null); setAccessError(true) }
      } finally { if (mounted && current === generation) setCheckingSession(false) }
    }
    void refresh()
    const onFocus = () => { void refresh() }
    window.addEventListener('focus', onFocus)
    const timer = window.setInterval(onFocus, 30000)
    return () => { mounted = false; window.clearInterval(timer); window.removeEventListener('focus', onFocus) }
  }, [revision])
  async function logout() {
    try {
      const result = await signOut()
      if (result?.error) throw result.error
      setProfile(null); setAuthenticated(false); setAccessError(false); navigate('/')
    } catch { setAccessError(true); setProfile(null) }
  }
  if (checkingSession) return <main className="flex min-h-screen items-center justify-center bg-slate-100 text-sm text-slate-500">Loading...</main>
  if (accessError) return <main className="mx-auto max-w-lg p-6"><div role="alert"><h1 className="text-2xl font-semibold">Account access unavailable</h1><p className="mt-3">Your account may be inactive, or access could not be verified. Contact your administrator or try again.</p></div><button className="mt-4 rounded-xl bg-violet-600 px-4 py-2 text-white" onClick={() => setRevision(value => value + 1)}>Try again</button><button className="ml-3 p-2" onClick={() => void logout()}>Sign out</button></main>
  if (!authenticated || !profile) return <LoginScreen onAuthenticated={() => { setCheckingSession(true); setRevision(value => value + 1); navigate('/') }} />
  const role = profile.role
  const denied = <section role="alert" className="mx-auto max-w-xl p-6"><h1 className="text-2xl font-semibold">Access denied</h1><p className="mt-2">Your role does not have access to this page.</p></section>
  const guard = (path: string, page: React.ReactNode) => canOpenPage(role, path) ? page : denied
  return <AppShell role={role}><Routes>
    {(['reservations','guests','tasks','blocks'] as const).map(mode => <Route key={mode} path={`/${mode}`} element={guard(`/${mode}`, <OperationsPage key={`${mode}-${role}`} mode={mode} role={role}/>)} />)}
    <Route path="/" element={role === 'cleaning' ? <CleaningPage onLogout={() => void logout()} /> : <HomePage onLogout={() => { setProfile(null); setAuthenticated(false) }} />} />
    <Route path="/calendar" element={guard('/calendar', <CalendarPage role={role} />)} />
    <Route path="/backup" element={guard('/backup', <BackupPage />)} />
    <Route path="/edit-reservation/:id" element={guard('/edit-reservation/id', <EditReservationPage role={role} />)} />
    <Route path="/properties" element={guard('/properties', <PropertiesPage role={role} />)} />
    <Route path="/new-booking" element={guard('/new-booking', <NewBookingPage />)} />
    <Route path="/settings" element={<SettingsPage role={role} />} />
    <Route path="/people" element={guard('/people', <PeoplePage />)} />
    <Route path="/calendar-sources" element={guard('/calendar-sources', <AdministrationPages mode="calendar-sources" />)} />
    <Route path="/notifications" element={<AdministrationPages mode="notifications" />} />
    <Route path="/account" element={<AdministrationPages mode="account" />} />
    <Route path="*" element={denied} />
  </Routes></AppShell>
}
export default App


