import { env } from '@/env';
import { parseError } from '@repo/observability/error';
import { secure } from '@repo/security';
import {
  noseconeMiddleware,
  noseconeOptions,
  noseconeOptionsWithToolbar,
} from '@repo/security/middleware';
import { createMiddlewareClient } from '@repo/supabase/clients/middleware-client';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  // matcher tells Next.js which routes to run the middleware on. This runs the
  // middleware on all routes except for static assets and Posthog ingest
  matcher: ['/((?!_next/static|_next/image|ingest|favicon.ico).*)'],
};

const securityHeaders = env.FLAGS_SECRET
  ? noseconeMiddleware(noseconeOptionsWithToolbar)
  : noseconeMiddleware(noseconeOptions);

export default async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    // Cast both request and response to any to bypass the type mismatches
    // This is safe because the underlying implementations are compatible
    const supabase = createMiddlewareClient(req as any, res as any);

    // Refresh session if expired - required for Server Components
    await supabase.auth.getSession();

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
        req
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
