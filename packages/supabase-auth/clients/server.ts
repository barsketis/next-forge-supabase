import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type {} from 'next/server';
import { keys } from '../keys';

// Cookie interfaces based on the design doc requirements
interface CookieReader {
  cookies: {
    getAll(): { name: string; value: string }[];
  };
}

interface CookieWriter {
  cookies: {
    set(options: { name: string; value: string } & CookieOptions): void;
  };
}

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
        getAll: async () => {
          const cookieStore = await cookies();
          return cookieStore.getAll();
        },
        setAll: async (cookiesToSet) => {
          try {
            const cookieStore = await cookies();
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a server client with admin privileges
 * Use this for operations that require full database access
 * IMPORTANT: Only use on the server, never expose this client to the browser
 * https://supabase.com/docs/guides/troubleshooting/performing-administration-tasks-on-the-server-side-with-the-servicerole-secret-BYM4Fa
 * @returns Supabase client with admin privileges
 */
export function getAdminClient(): SupabaseClient {
  const env = keys();

  return createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

/**
 * Create a Supabase client specifically for use in middleware
 * @param req Object that can read cookies (like NextRequest)
 * @param res Object that can write cookies (like NextResponse)
 * @returns Supabase client configured for middleware
 */
export function createServerClientForMiddleware(
  req: CookieReader,
  res: CookieWriter
): SupabaseClient {
  const env = keys();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => {
          return req.cookies.getAll();
        },
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            res.cookies.set({ name, value, ...options });
          }
        },
      },
    }
  );
}
