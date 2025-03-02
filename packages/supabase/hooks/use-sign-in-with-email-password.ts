import type { AuthResponse } from '@supabase/supabase-js';
import { useCallback, useState } from 'react';
import { type SignInSchema, signInSchema } from '../schemas';
import { useSupabase } from './use-supabase';

interface SignInState {
  isLoading: boolean;
  error: string | null;
  data: AuthResponse['data'] | null;
}

/**
 * @name useSignInWithEmailPassword
 * @description Use Supabase to sign in a user with email and password in a React component
 */
export function useSignInWithEmailPassword() {
  const client = useSupabase();
  const [state, setState] = useState<SignInState>({
    isLoading: false,
    error: null,
    data: null,
  });

  const mutate = useCallback(
    async (credentials: SignInSchema) => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Validate credentials with Zod
        const validated = signInSchema.parse(credentials);

        const response = await client.auth.signInWithPassword(validated);

        if (response.error) {
          throw response.error.message;
        }

        const user = response.data?.user;
        const identities = user?.identities ?? [];

        // if the user has no identities, it means that the email is taken
        if (identities.length === 0) {
          throw new Error('User already registered');
        }

        setState((prev) => ({
          ...prev,
          isLoading: false,
          data: response.data,
        }));
        return response.data;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
        }));
        throw error;
      }
    },
    [client]
  );

  return {
    mutate,
    isLoading: state.isLoading,
    error: state.error,
    data: state.data,
  };
}
