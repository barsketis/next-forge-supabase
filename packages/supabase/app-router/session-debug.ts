import 'server-only';
import type { Session } from '@supabase/supabase-js';
import type { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { cookies } from 'next/headers';
import { getSupabaseAppServerClient } from './server-client';

/**
 * Debug utility for troubleshooting session and cookie issues
 * Logs detailed information about cookie state and session status
 */
export async function debugSessionState(label = 'Session debug') {
  try {
    // Get cookies directly
    const cookieStore = await cookies();
    const allCookies = cookieStore.getAll();
    const authCookies = allCookies.filter(
      (cookie: RequestCookie) =>
        cookie.name.includes('supabase') ||
        cookie.name.includes('sb-') ||
        cookie.name.startsWith('sb')
    );

    // Get session via Supabase client
    const supabase = await getSupabaseAppServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.group(`[${label}]`);
    console.log('Authenticated:', !!session);

    if (session) {
      console.log('User ID:', session.user.id);
      console.log('Email:', session.user.email);

      if (session.expires_at) {
        console.log(
          'Session expiry:',
          new Date(session.expires_at * 1000).toISOString()
        );
      }

      // Check for optional properties with type checking
      // Using type assertion to avoid the 'any' type error
      // These properties might exist in the internal implementation but not in the type definitions
      interface ExtendedSession extends Session {
        created_at?: number;
        updated_at?: number;
      }

      const extendedSession = session as ExtendedSession;

      if (extendedSession.created_at) {
        console.log(
          'Session created:',
          new Date(extendedSession.created_at).toISOString()
        );
      }

      if (extendedSession.updated_at) {
        console.log(
          'Last updated:',
          new Date(extendedSession.updated_at).toISOString()
        );
      }

      // Check if session is about to expire
      const expiresAt = session.expires_at
        ? new Date(session.expires_at * 1000)
        : null;
      const now = new Date();
      if (expiresAt && expiresAt < now) {
        console.warn('⚠️ Session has expired!');
      } else if (expiresAt) {
        const minutesRemaining = Math.round(
          (expiresAt.getTime() - now.getTime()) / (1000 * 60)
        );
        console.log(`Minutes until session expires: ${minutesRemaining}`);

        if (minutesRemaining < 30) {
          console.warn('⚠️ Session will expire soon!');
        }
      }
    }

    console.log('Auth cookies found:', authCookies.length);

    for (const cookie of authCookies) {
      // Only log properties that exist on the RequestCookie type
      console.log(`Cookie: ${cookie.name}`, {
        value: `${cookie.value.substring(0, 20)}...`,
      });
    }

    if (authCookies.length === 0) {
      console.warn(
        '⚠️ No auth cookies found! This suggests a cookie storage issue.'
      );
    }

    console.groupEnd();

    return {
      isAuthenticated: !!session,
      sessionData: session,
      cookiesFound: authCookies.length,
      hasCookieIssue: authCookies.length === 0 && !!session,
    };
  } catch (error) {
    console.error('[Session Debug] Error:', error);
    throw error;
  }
}
