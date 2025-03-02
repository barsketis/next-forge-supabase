import type { SupabaseClient, User } from '@supabase/supabase-js';

const SIGN_IN_PATH = '/auth/sign-in';

/**
 * @name requireUser
 * @description Require a session to be present in the request
 * @param client
 */
export async function requireUser(client: SupabaseClient): Promise<
  | {
      error: null;
      data: User;
    }
  | {
      error: AuthenticationError;
      data: null;
      redirectTo: string;
    }
> {
  const { data, error } = await client.auth.getUser();

  if (!data.user || error) {
    return {
      data: null,
      error: new AuthenticationError(),
      redirectTo: SIGN_IN_PATH,
    };
  }

  return {
    error: null,
    data: data.user,
  };
}

class AuthenticationError extends Error {
  constructor() {
    super('Authentication required');
  }
}
