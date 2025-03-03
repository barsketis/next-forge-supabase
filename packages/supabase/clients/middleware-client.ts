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
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );
}
