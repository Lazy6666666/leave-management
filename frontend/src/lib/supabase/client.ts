import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export function createClient() {
  // Migrate away from deprecated createBrowserSupabaseClient
  return createPagesBrowserClient()
}

// REFACTOR: Provide a default browser client instance for modules expecting a named 'supabase' export
// Some components import { supabase } from '@/lib/supabase/client'.
// To preserve existing usage without deleting imports, expose a singleton here.
export const supabase = createClient()
