'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { getSession } from '../actions/auth';

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const data = await getSession();
        setSession(data);
      } catch (error) {
        console.error('Error fetching session:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  return {
    session,
    loading,
  };
}
