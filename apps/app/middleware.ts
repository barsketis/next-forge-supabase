import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { createMiddlewareClient } from '@repo/supabase/clients/middleware-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { env } from './env';

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export async function middleware(request: NextRequest) {
  try {
    const response = NextResponse.next();

    // Create Supabase client for auth
    const supabase = createMiddlewareClient(request, response);
    await supabase.auth.getSession();

    // Apply security headers
    const securityResponse = await securityHeaders();

    // Copy security headers to our response
    for (const [key, value] of Object.entries(securityResponse.headers)) {
      if (typeof value === 'string') {
        response.headers.set(key, value);
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/:path*',
  ],
};
