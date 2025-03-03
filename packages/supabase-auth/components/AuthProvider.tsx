'use client';

import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { getBrowserClient } from '../clients/browser';
import type { AuthContext as AuthContextType } from '../types';

// Create the authentication context
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  error: null,
});

// Hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: ReactNode;
}

// Auth provider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = getBrowserClient();

  useEffect(() => {
    async function getSession() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        log.error('Error getting session:', { error });
        throw error;
      }
      return session;
    }

    async function getUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) {
        log.error('Error getting user:', { error });
        throw error;
      }
      return user;
    }

    async function initializeAuth() {
      try {
        setIsLoading(true);
        const session = await getSession();
        setSession(session);

        if (session) {
          const user = await getUser();
          setUser(user);
        }
      } catch (err) {
        const errorMessage = parseError(err);
        log.error('Authentication initialization failed:', {
          error: err,
          message: errorMessage,
        });
        setError(err instanceof Error ? err : new Error(errorMessage));
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = {
    user,
    session,
    isLoading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
