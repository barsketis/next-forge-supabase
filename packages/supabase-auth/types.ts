import type { Session, User } from '@supabase/supabase-js';

/**
 * Authentication context type
 */
export interface AuthContext {
  /** Current user if authenticated, null otherwise */
  user: User | null;
  /** Current session if authenticated, null otherwise */
  session: Session | null;
  /** Whether authentication state is loading */
  isLoading: boolean;
  /** Authentication error if any */
  error: Error | null;
}

/**
 * Authentication error
 */
export class AuthenticationError extends Error {
  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Result of authentication operations
 */
export type AuthResult<T = unknown> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: Error;
      redirectTo?: string;
    };
