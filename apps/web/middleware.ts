import { env } from '@/env';
import { parseError } from '@repo/observability/error';
import { secure } from '@repo/security';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { updateSession } from '@repo/supabase-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Static assets and API routes that should bypass auth
const BYPASS_PATHS = ['/_next', '/static', '/ingest', '/favicon.ico'];

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Early return for bypassed paths
  if (BYPASS_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  try {
    // @ts-expect-error NextRequest from different Next.js versions
    await updateSession(request);

    // If no Arcjet key, just apply security headers
    if (!env.ARCJET_KEY) {
      return securityHeaders();
    }

    // Check bot protection
    await secure(
      ['CATEGORY:SEARCH_ENGINE', 'CATEGORY:PREVIEW', 'CATEGORY:MONITOR'],
      request
    );

    // Apply security headers after bot check
    return securityHeaders();
  } catch (error) {
    // Handle expected auth errors silently
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'refresh_token_not_found'
    ) {
      return securityHeaders();
    }

    // Log and handle other errors
    parseError(error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|ingest|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
