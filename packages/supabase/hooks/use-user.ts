import type { User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { useSupabase } from './use-supabase';

/**
 * @name useUser
 * @description Use Supabase to get the current user in a React component
 * @param initialData
 */
export function useUser(initialData?: User | null) {
  const client = useSupabase();
  const [user, setUser] = useState<User | null | undefined>(initialData);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await client.auth.getUser();

      if (response.error) {
        setUser(undefined);
        return;
      }

      if (response.data?.user) {
        setUser(response.data.user);
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch user'));
    } finally {
      setIsLoading(false);
    }
  }, [client.auth]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    data: user,
    isLoading,
    error,
    refetch: fetchUser,
  };
}
