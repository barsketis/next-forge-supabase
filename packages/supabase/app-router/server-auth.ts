import 'server-only';
import type { Session, User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseAppServerClient } from './server-client';

type AuthOptions = {
  redirectTo?: string;
};

type AuthResult =
  | { isAuthenticated: true; session: Session; user: User }
  | { isAuthenticated: false; session: null; user: null };

/**
 * Check authentication status on the server
 *
 * @example
 * // Redirect if unauthenticated
 * const { session, user } = await requireAuth();
 *
 * @example
 * // Just check auth status without redirecting
 * const { isAuthenticated, session, user } = await checkAuth();
 */
export async function checkAuth(): Promise<AuthResult> {
  const supabase = await getSupabaseAppServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return {
      isAuthenticated: false,
      session: null,
      user: null,
    };
  }

  return {
    isAuthenticated: true,
    session,
    user: session.user,
  };
}

/**
 * Require authentication on the server
 * Redirects to sign-in page if not authenticated
 */
export async function requireAuth(options: AuthOptions = {}): Promise<{
  session: Session;
  user: User;
}> {
  const result = await checkAuth();

  if (!result.isAuthenticated) {
    const redirectTo = options.redirectTo || '/sign-in';
    redirect(redirectTo);
  }

  return {
    session: result.session,
    user: result.user,
  };
}

/**
 * Create a route handler wrapper for API routes that require authentication
 *
 * @example
 * export async function GET(request: Request) {
 *   return withAuth(async (user) => {
 *     // Your authenticated API logic here
 *     return NextResponse.json({ message: `Hello ${user.email}` });
 *   });
 * }
 */
export async function withAuth<T>(
  handler: (user: User) => Promise<T>,
  { redirectOnFailure = false }: { redirectOnFailure?: boolean } = {}
): Promise<T | Response> {
  const cookieStore = cookies();
  const supabase = await getSupabaseAppServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    if (redirectOnFailure) {
      redirect('/sign-in');
    }

    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  return handler(session.user);
}
