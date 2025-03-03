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

// Static assets and API routes that should bypass auth
const BYPASS_PATHS = ['/api', '/_next', '/static', '/ingest', '/favicon.ico'];

export async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl.pathname;

    // Early return for bypassed paths
    if (BYPASS_PATHS.some((path) => pathname.startsWith(path))) {
      return NextResponse.next();
    }

    const res = NextResponse.next();

    // Create Supabase client for auth
    // @ts-ignore - Next.js types mismatch between packages
    const supabase = createMiddlewareClient(req, res);

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Debug logging
    console.log({
      pathname,
      hasSession: !!session,
    });

    // Apply security headers
    const securityResponse = await securityHeaders();
    for (const [key, value] of Object.entries(securityResponse.headers)) {
      if (typeof value === 'string') {
        res.headers.set(key, value);
      }
    }

    // Let the route group layouts handle their own auth
    return res;
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
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
