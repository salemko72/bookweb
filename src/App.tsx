import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { LoginForm } from './components/LoginForm'
import { AppShell } from './components/AppShell'
import { CalendarPage } from './pages/CalendarPage'
import { HomePage } from './pages/HomePage'
import { NewBookingPage } from './pages/NewBookingPage'
import { PropertiesPage } from './pages/PropertiesPage'
import { SettingsPage } from './pages/SettingsPage'
import { getCurrentSession } from './lib/auth-supabase'

function App() {
  const [checkingSession, setCheckingSession] = useState(true)
  const [authenticated, setAuthenticated] = useState(false)

  useEffect(() => {
    let mounted = true

 getCurrentSession().then((session) => {
  if (!mounted) return
  setAuthenticated(Boolean(session))
  setCheckingSession(false)
})

    return () => {
      mounted = false
    }
  }, [])

  if (checkingSession) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </main>
    )
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl bg-white p-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-widest text-violet-500">
              Booking Manager
            </p>
            <h1 className="mt-3 text-4xl font-semibold text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-slate-500">
              Sign in to manage your properties.
            </p>
          </div>

          <LoginForm onAuthenticated={() => setAuthenticated(true)} />
        </div>
      </main>
    )
  }

  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/new-booking" element={<NewBookingPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </AppShell>
  )
}

export default App
