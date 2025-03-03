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

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets and Posthog ingest
  matcher: [
    '/((?!_next/static|_next/image|ingest|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export default async function middleware(request: NextRequest) {
  try {
    // Call updateSession to maintain auth state, but don't use its response
    // This avoids type issues between different Next.js versions
    try {
      await updateSession(request as any);
    } catch (error) {
      // Log error using the observability package
      parseError(error);
    }

    if (!env.ARCJET_KEY) {
      return securityHeaders();
    }

    try {
      await secure(
        [
          // See https://docs.arcjet.com/bot-protection/identifying-bots
          'CATEGORY:SEARCH_ENGINE', // Allow search engines
          'CATEGORY:PREVIEW', // Allow preview links to show OG images
          'CATEGORY:MONITOR', // Allow uptime monitoring services
        ],
        request
      );

      return securityHeaders();
    } catch (error) {
      const message = parseError(error);
      return NextResponse.json({ error: message }, { status: 403 });
    }
  } catch (error) {
    const message = parseError(error);
    return NextResponse.json({ error: message }, { status: 403 });
  }
}
