console.log('ENV TEST:', {
  url: import.meta.env.VITE_SUPABASE_URL,
  keyExists: Boolean(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY),
})
