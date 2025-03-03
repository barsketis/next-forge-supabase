import type { SupabaseClient, User } from '@supabase/supabase-js';
import { type AuthResult, AuthenticationError } from '../types';

const SIGN_IN_PATH = '/sign-in';

/**
 * Require a user to be authenticated
 * Use this in server components or route handlers to enforce authentication
 * @param client - Supabase client instance
 * @returns AuthResult with user or error
 */
export async function requireUser(
  client: SupabaseClient
): Promise<AuthResult<User>> {
  try {
    const { data, error } = await client.auth.getUser();

    if (!data.user || error) {
      return {
        data: null,
        error: new AuthenticationError(),
        redirectTo: SIGN_IN_PATH,
      };
    }

    return {
      data: data.user,
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error ? err : new Error('Unknown authentication error'),
      redirectTo: SIGN_IN_PATH,
    };
  }
}
