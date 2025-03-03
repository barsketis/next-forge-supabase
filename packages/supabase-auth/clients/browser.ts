import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { keys } from '../keys';

/**
 * Create a Supabase client for use in browser contexts
 * This is for client components and hooks
 * @returns Supabase client
 */
export function getBrowserClient(): SupabaseClient {
  const env = keys();

  return createBrowserClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
