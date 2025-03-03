import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { updateSession } from '@repo/supabase-auth/utils';
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

    // Update the Supabase auth session
    try {
      // Type casting needed due to version differences between Next.js packages
      // @ts-expect-error NextRequest from different Next.js versions
      const response = await updateSession(req);

      // Apply security headers
      const securityResponse = await securityHeaders();

      // Copy security headers to the response
      for (const [key, value] of Object.entries(securityResponse.headers)) {
        if (typeof value === 'string') {
          response.headers.set(key, value);
        }
      }

      // Debug logging
      log.info(`Processed request for path: ${pathname}`);

      return response;
    } catch (updateError) {
      // Log auth-related errors
      parseError(updateError);

      // Continue with security headers only
      return securityHeaders();
    }
  } catch (error) {
    parseError(error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
