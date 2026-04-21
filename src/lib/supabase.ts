import { createClient } from '@supabase/supabase-js'

const url  = import.meta.env.VITE_SUPABASE_URL  as string
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabaseConfigError =
  !url || !key
    ? 'Configuration manquante : ajoute VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans les variables d’environnement Vercel.'
    : null

export const supabase = supabaseConfigError ? null : createClient(url, key)
