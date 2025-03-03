import 'server-only';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getSupabaseServerClient } from '../clients/server-client';
import type { Database } from '../database.types';

/**
 * Creates a Supabase client for use in App Router Server Components.
 */
export function getSupabaseAppServerClient<GenericSchema = Database>() {
  return getSupabaseServerClient<GenericSchema>({
    get: async (name: string) => {
      const cookieStore = await cookies();
      return cookieStore.get(name)?.value;
    },
    set: async (name: string, value: string, options?: CookieOptions) => {
      const cookieStore = await cookies();
      cookieStore.set(name, value, options);
    },
  });
}
