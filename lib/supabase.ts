import { createClient } from "@supabase/supabase-js"

// Your Supabase project details
const supabaseUrl = "https://ojtwtbodxamejkzfycpl.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHd0Ym9keGFtZWpremZ5Y3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA1MTE4MDMsImV4cCI6MjA2NjA4NzgwM30.gY8nX_263TwhyD6HoXOCSp60W_JH95vKDpksgFWA_TM"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qdHd0Ym9keGFtZWpremZ5Y3BsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDUxMTgwMywiZXhwIjoyMDY2MDg3ODAzfQ.MNRR6LSSghUJ0l1C1bu54bkFjPLSBCsAvDECn6gGSiI"

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side client with service role key for admin operations
export const createServerClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey)
}

// Client with anon key for public operations
export const createPublicClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}
