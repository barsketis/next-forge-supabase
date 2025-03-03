import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import type { Database } from '../database.types';
import { keys } from '../keys';

/**
 * Creates a Supabase client for use in the Server.
 * This is a base implementation that works with any cookie store.
 */
export function getSupabaseServerClient<
  GenericSchema = Database,
>(cookieStore?: {
  get: (name: string) => Promise<string | undefined> | string | undefined;
  set: (
    name: string,
    value: string,
    options?: CookieOptions
  ) => Promise<void> | void;
}) {
  const env = keys();

  return createServerClient<GenericSchema>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          if (!cookieStore) return undefined;
          const value = cookieStore.get(name);
          return value instanceof Promise ? value : Promise.resolve(value);
        },
        set(name: string, value: string, options?: CookieOptions) {
          if (!cookieStore) return;
          const result = cookieStore.set(name, value, options);
          return result instanceof Promise ? result : Promise.resolve();
        },
        remove(name: string, options?: CookieOptions) {
          if (!cookieStore) return;
          const result = cookieStore.set(name, '', { ...options, maxAge: 0 });
          return result instanceof Promise ? result : Promise.resolve();
        },
      },
    }
  );
}
