import { createServerClient } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from '../database.types';
import { keys } from '../keys';

/**
 * Creates a middleware client for Supabase.
 * This client is specifically for use in Next.js middleware.
 *
 * @param {NextRequest} request - The Next.js request object.
 * @param {NextResponse} response - The Next.js response object.
 */
export function createMiddlewareClient<GenericSchema = Database>(
  request: NextRequest,
  response: NextResponse
) {
  const env = keys();

  return createServerClient<GenericSchema>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Clear existing auth cookies first
          const cookiesToClear = ['sb-access-token', 'sb-refresh-token'];
          for (const name of cookiesToClear) {
            if (request.cookies.has(name)) {
              response.cookies.delete(name);
            }
          }

          // Set new cookies
          for (const cookie of cookiesToSet) {
            response.cookies.set({
              name: cookie.name,
              value: cookie.value,
              ...cookie.options,
              // Ensure cookies have reasonable max age
              maxAge: Math.min(
                cookie.options?.maxAge || 60 * 60 * 24,
                60 * 60 * 24
              ), // Max 24 hours
            });
          }
        },
      },
    }
  );
}
