'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBrowserClient } from '../clients/browser';
import { emailPasswordSchema } from '../utils/schemas';
import { useAuth } from './AuthProvider';

type SignInProps = {
  redirectTo?: string;
  revalidatePaths?: string[];
  onSuccess?: (data: { success: true; session: unknown }) => void;
  onError?: (error: Error) => void;
};

export function SignIn({
  redirectTo = '/',
  revalidatePaths = [],
  onSuccess,
  onError,
}: SignInProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getBrowserClient();
  const { error: authError } = useAuth();

  // If there's an auth error from the context, show it
  useEffect(() => {
    if (authError) {
      handleError(authError);
    }
  }, [authError]);

  function handleError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    let userMessage = message; // Default to the raw message

    // Friendly error messages
    if (message.includes('Invalid login credentials')) {
      userMessage = 'The email or password you entered is incorrect';
    } else if (message.includes('Email not confirmed')) {
      userMessage = 'Please check your email to confirm your account';
    } else if (message.includes('Rate limit')) {
      userMessage = 'Too many sign in attempts. Please try again later';
    } else if (message.includes('Network')) {
      userMessage = 'Unable to connect. Please check your internet connection';
    } else if (message.includes('User not found')) {
      userMessage = 'No account found with this email address';
    } else if (message.includes('Account locked')) {
      userMessage = 'Your account has been locked. Please contact support';
    }

    setError(userMessage);
    onError?.(error instanceof Error ? error : new Error(message));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate with Zod
      emailPasswordSchema.parse({ email, password });

      // Use Supabase client directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // If we have specific paths to revalidate
      if (revalidatePaths.length > 0) {
        for (const path of revalidatePaths) {
          router.refresh();
        }
      }

      // Call onSuccess if provided
      onSuccess?.({ success: true, session: data.session });

      // Auto-redirect if specified and no returnTo path
      if (redirectTo && !returnTo) {
        router.push(redirectTo);
      } else if (returnTo) {
        router.push(returnTo);
      }

      setIsLoading(false);
    } catch (error) {
      handleError(error);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="font-bold text-3xl">Sign In</h2>
        <p className="mt-2 text-gray-600 text-sm">
          Enter your credentials to access your account
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block font-medium text-sm">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium text-sm">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 font-semibold text-sm text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600 focus-visible:outline-offset-2"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>
      </form>
    </div>
  );
}
