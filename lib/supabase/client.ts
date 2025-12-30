import { createBrowserClient } from '@supabase/ssr'

// Singleton client instance - prevents creating new client on every call
let client: ReturnType<typeof createBrowserClient> | null = null

export const createClient = () => {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
