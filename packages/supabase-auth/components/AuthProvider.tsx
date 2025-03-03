'use client';

import { parseError } from '@repo/observability/error';
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
    // Get the initial session and user
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Get session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        setSession(session);

        // Get user if session exists
        if (session) {
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();

          if (userError) {
            throw userError;
          }

          setUser(user);
        }
      } catch (err) {
        parseError(err);
        setError(
          err instanceof Error ? err : new Error('Unknown authentication error')
        );
      } finally {
        setIsLoading(false);
      }
    };

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
