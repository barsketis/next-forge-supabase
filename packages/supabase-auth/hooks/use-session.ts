'use client';

import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { getBrowserClient } from '../clients/browser';

/**
 * Hook to get and subscribe to session changes
 * @returns The current session and loading state
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = getBrowserClient();

  useEffect(() => {
    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return {
    session,
    loading,
  };
}
