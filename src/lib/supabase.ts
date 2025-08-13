import { createClient } from '@supabase/supabase-js'

// Get environment variables with fallback to actual production values if env vars are missing
const getSupabaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (envUrl && envUrl !== 'https://placeholder.supabase.co') {
    return envUrl
  }
  // Fallback to actual production URL if env var is missing or placeholder
  return 'https://jvzqtyzblkvkrihtequd.supabase.co'
}

const getSupabaseAnonKey = () => {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (envKey && envKey !== 'placeholder-key') {
    return envKey
  }
  // Fallback to actual production anon key if env var is missing or placeholder
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzODI0NDMsImV4cCI6MjA2Njk1ODQ0M30.Pyq00_qFaJUhl-Sldb7nSqR-kP3RREfiwOCGZ5NC-Pw'
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

console.log('[Supabase] Initializing with URL:', supabaseUrl)
console.log('[Supabase] Using key:', supabaseAnonKey.substring(0, 20) + '...')

// Client for frontend operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false
  }
})

// Admin client for backend operations (with service role key)
const getServiceRoleKey = () => {
  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (envKey && envKey !== 'placeholder-key') {
    return envKey
  }
  // Fallback for backend operations
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2enF0eXpibGt2a3JpaHRlcXVkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4MjQ0MywiZXhwIjoyMDY2OTU4NDQzfQ.lFrR3ygl_Wel0UpoHdJ4En2uJOd5vN4uPVlPUXsnlI0'
}

export const supabaseAdmin = createClient(
  supabaseUrl,
  getServiceRoleKey(),
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)