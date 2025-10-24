import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies, headers } from 'next/headers'

export function createClient() {
  // Use the App Router-compatible client
  return createServerComponentClient({ cookies })
}
