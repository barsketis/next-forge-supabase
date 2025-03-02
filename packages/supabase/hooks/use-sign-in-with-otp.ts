import type { SignInWithPasswordlessCredentials } from '@supabase/supabase-js';

import { log } from '@repo/observability/log';
import { useSupabase } from './use-supabase';

/**
 * @name useSignInWithOtp
 * @description Use Supabase to sign in a user with an OTP in a React component
 */
export function useSignInWithOtp() {
  const client = useSupabase();

  const signInWithOtp = async (
    credentials: SignInWithPasswordlessCredentials
  ) => {
    const result = await client.auth.signInWithOtp(credentials);

    if (result.error) {
      if (shouldIgnoreError(result.error.message)) {
        log.warn('Ignoring OTP error during development', {
          error: result.error.message,
        });

        return {} as never;
      }

      throw result.error.message;
    }

    return result.data;
  };

  return { signInWithOtp };
}

function shouldIgnoreError(error: string) {
  return isSmsProviderNotSetupError(error);
}

function isSmsProviderNotSetupError(error: string) {
  return error.includes('sms Provider could not be found');
}
