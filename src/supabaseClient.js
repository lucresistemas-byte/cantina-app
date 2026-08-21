import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Esta configuración es la que activa la "magia" de la persistencia
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Esto hace que se guarde en localStorage
    autoRefreshToken: true, // Esto hace que el token no caduque
    storageKey: 'sb-cantina-auth', // Nombre de la cookie/storage
  },
})