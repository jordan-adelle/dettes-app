import { createClient } from '@supabase/supabase-js'

const url =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined) ||
  __APP_SUPABASE_URL__ ||
  undefined

const key =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
  (import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string | undefined) ||
  __APP_SUPABASE_KEY__ ||
  undefined

export const supabaseConfigError =
  !url || !key
    ? 'Configuration manquante : ajoute une URL Supabase et une cle publique. Noms acceptes : VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY, NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY, ou les variables Vercel SUPABASE_URL / SUPABASE_ANON_KEY.'
    : null

export const supabase =
  supabaseConfigError || !url || !key ? null : createClient(url, key)
