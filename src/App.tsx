import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

function App() {
  const [status, setStatus] = useState('Testing Supabase connection...')

  useEffect(() => {
    const testConnection = async () => {
      const { error } = await supabase.auth.getSession()

      if (error) {
        setStatus('Supabase error: ' + error.message)
        return
      }

      setStatus('Supabase connection OK')
    }

    testConnection()
  }, [])

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="mx-auto max-w-3xl rounded-2xl bg-white p-10 shadow-sm">
        <h1 className="text-4xl font-bold text-slate-900">
          Booking Manager
        </h1>

        <p className="mt-4 text-lg text-slate-600">
          {status}
        </p>
      </div>
    </main>
  )
}

export default App
