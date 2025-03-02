import { useState } from 'react';
import { type UpdateUserSchema, updateUserSchema } from '../schemas';
import { useSupabase } from './use-supabase';

/**
 * @name useUpdateUser
 * @description Use Supabase to update the current user in a React component
 */
export function useUpdateUser() {
  const client = useSupabase();
  const [isPending, setIsPending] = useState(false);

  const updateUser = async (attributes: UpdateUserSchema) => {
    try {
      setIsPending(true);

      // Validate attributes with Zod
      const validated = updateUserSchema.parse(attributes);
      const { redirectTo, ...params } = validated;

      const response = await client.auth.updateUser(params, {
        emailRedirectTo: redirectTo,
      });

      if (response.error) {
        throw response.error;
      }

      return response.data;
    } finally {
      setIsPending(false);
    }
  };

  return {
    updateUser,
    isPending,
  };
}
