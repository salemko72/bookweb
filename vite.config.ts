import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')

  console.log('VITE ENV CHECK:', {
    url: env.VITE_SUPABASE_URL,
    keyExists: Boolean(env.VITE_SUPABASE_PUBLISHABLE_KEY),
  })

  return {
    plugins: [react(), tailwindcss()],
  }
})
