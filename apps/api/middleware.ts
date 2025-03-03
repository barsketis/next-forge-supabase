import { parseError } from '@repo/observability/error';
import { createServerClientForMiddleware } from '@repo/supabase-auth/clients';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next();
    const supabase = createServerClientForMiddleware(req, res);

    // Try to get the session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // If there's no session and this is an API route, return unauthorized
    if (!session && req.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Add the user to the request for use in API routes
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-id', session?.user?.id || '');
    requestHeaders.set('x-user-email', session?.user?.email || '');
    requestHeaders.set('x-user-role', session?.user?.role || '');

    // Return the response with the added headers
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
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
    // Skip Next.js internals and static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
