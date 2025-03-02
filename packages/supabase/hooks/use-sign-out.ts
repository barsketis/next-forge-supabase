import { useSupabase } from './use-supabase';

/**
 * @name useSignOut
 * @description Use Supabase to sign out a user in a React component
 */
export function useSignOut() {
  const client = useSupabase();

  const signOut = async () => {
    return client.auth.signOut();
  };

  return { signOut };
}
