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

  if (!cookieStore) {
    console.warn('No cookie store provided to getSupabaseServerClient');
  }

  return createServerClient<GenericSchema>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          if (!cookieStore) {
            console.warn(
              `Cookie get attempted but no store available: ${name}`
            );
            return undefined;
          }
          const value = cookieStore.get(name);
          console.log(`Cookie get: ${name}, has value: ${!!value}`);
          return value instanceof Promise ? value : Promise.resolve(value);
        },
        set(name: string, value: string, options?: CookieOptions) {
          if (!cookieStore) {
            console.warn(
              `Cookie set attempted but no store available: ${name}`
            );
            return;
          }
          console.log(`Setting cookie: ${name} with options:`, options);
          const result = cookieStore.set(name, value, options);
          return result instanceof Promise ? result : Promise.resolve();
        },
        remove(name: string, options?: CookieOptions) {
          if (!cookieStore) {
            console.warn(
              `Cookie remove attempted but no store available: ${name}`
            );
            return;
          }
          console.log(`Removing cookie: ${name}`);
          const result = cookieStore.set(name, '', { ...options, maxAge: 0 });
          return result instanceof Promise ? result : Promise.resolve();
        },
      },
    }
  );
}
