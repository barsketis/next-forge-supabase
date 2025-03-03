import { type NextRequest, NextResponse } from 'next/server';
import { createServerClientForMiddleware } from '../clients/server';

/**
 * Update the Supabase auth session in a Next.js middleware context
 * Use this function in your middleware.ts file to handle authentication
 *
 * @example
 * // middleware.ts
 * import { updateSession } from '@/packages/supabase-auth';
 *
 * export async function middleware(request: NextRequest) {
 *   return await updateSession(request);
 * }
 *
 * export const config = {
 *   matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
 * };
 *
 * @param request - The Next.js request object
 * @returns NextResponse with the updated session
 */
export async function updateSession(request: NextRequest) {
  const response = NextResponse.next({
    request,
  });

  // Use our middleware client instead of direct createServerClient
  const supabase = createServerClientForMiddleware(request, response);

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  await supabase.auth.getUser();

  // You can optionally return a response based on the user's authentication status
  // Uncomment the following code to enable redirection to a login page for unauthenticated users
  /*
  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, redirect the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  */

  return response;
}
