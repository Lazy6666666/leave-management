import { createClient } from '@/lib/supabase/server';

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}
