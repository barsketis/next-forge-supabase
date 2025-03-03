import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { NextRequest, NextResponse } from 'next/server';
import { keys } from '../keys';

/**
 * Create a Supabase client for use in server contexts
 * This includes Server Components, Route Handlers, and Server Actions
 * @returns Supabase client
 */
export function getServerClient(): SupabaseClient {
  const env = keys();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set(name, value, options);
        },
        remove: async (name: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set(name, '', { ...options, maxAge: 0 });
        },
      },
    }
  );
}

/**
 * Create a server client with admin privileges
 * Use this for operations that require full database access
 * IMPORTANT: Only use on the server, never expose this client to the browser
 * @returns Supabase client with admin privileges
 */
export function getAdminClient(): SupabaseClient {
  const env = keys();

  // This function requires SUPABASE_SERVICE_ROLE_KEY to be set in environment variables
  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      // Admin client needs minimal cookie handling as it's only used server-side
      cookies: {
        get: async () => undefined,
        set: async () => {},
        remove: async () => {},
      },
    }
  );
}

/**
 * Create a Supabase client specifically for use in middleware
 * @param req The Next.js request object
 * @param res The Next.js response object
 * @returns Supabase client configured for middleware
 */
export function createServerClientForMiddleware(
  req: NextRequest,
  res: NextResponse
): SupabaseClient {
  const env = keys();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name: string) => {
          return req.cookies.get(name)?.value;
        },
        set: (name: string, value: string, options: CookieOptions) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: CookieOptions) => {
          res.cookies.set({ name, value: '', ...options });
        },
      },
    }
  );
}
