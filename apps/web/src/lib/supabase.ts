import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

// Client pour le côté client (browser)
export const supabase = process.env.NEXT_PUBLIC_SUPABASE_URL 
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null

// Client pour le côté serveur
export const createServerSupabaseClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    return null
  }
  
  return createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}