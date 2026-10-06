import { createClient } from '@supabase/supabase-js'
import { shareAwareFetch } from './shareContext'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

export const supabase =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }, global: { fetch: shareAwareFetch((...args) => fetch(...args), () => window.location.pathname) } })
    : null

export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase environment variables are missing.')
  }

  return supabase
}
