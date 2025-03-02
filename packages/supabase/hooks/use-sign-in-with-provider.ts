import type { SignInWithOAuthCredentials } from '@supabase/supabase-js';

import { useSupabase } from './use-supabase';

/**
 * @name useSignInWithProvider
 * @description Use Supabase to sign in a user with a provider in a React component
 */
export function useSignInWithProvider() {
  const client = useSupabase();

  const signInWithProvider = async (
    credentials: SignInWithOAuthCredentials
  ) => {
    const response = await client.auth.signInWithOAuth(credentials);

    if (response.error) {
      throw response.error.message;
    }

    return response.data;
  };

  return { signInWithProvider };
}
