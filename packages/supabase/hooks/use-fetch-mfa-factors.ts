import { useSupabase } from './use-supabase';

/**
 * @name useFetchAuthFactors
 * @description Use Supabase to fetch the MFA factors for a user in a React component
 * @param userId
 */
export function useFetchAuthFactors(userId: string) {
  const client = useSupabase();

  const fetchFactors = async () => {
    const { data, error } = await client.auth.mfa.listFactors();

    if (error) {
      throw error;
    }

    return data;
  };

  return { fetchFactors };
}
