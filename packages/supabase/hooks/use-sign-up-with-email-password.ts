import { useState } from 'react';
import { type SignUpSchema, signUpSchema } from '../schemas';
import { useSupabase } from './use-supabase';

/**
 * @name useSignUpWithEmailAndPassword
 * @description Use Supabase to sign up a user with email and password in a React component
 */
export function useSignUpWithEmailAndPassword() {
  const client = useSupabase();
  const [isPending, setIsPending] = useState(false);

  const signUp = async (params: SignUpSchema) => {
    try {
      setIsPending(true);
      // Validate all inputs with Zod
      const validated = signUpSchema.parse(params);
      const { emailRedirectTo, captchaToken, ...credentials } = validated;

      const response = await client.auth.signUp({
        ...credentials,
        options: {
          emailRedirectTo,
          captchaToken,
        },
      });

      if (response.error) {
        throw response.error.message;
      }

      const user = response.data?.user;
      const identities = user?.identities ?? [];

      // if the user has no identities, it means that the email is taken
      if (identities.length === 0) {
        throw new Error('User already registered');
      }

      return response.data;
    } finally {
      setIsPending(false);
    }
  };

  return {
    signUp,
    isPending,
  };
}
