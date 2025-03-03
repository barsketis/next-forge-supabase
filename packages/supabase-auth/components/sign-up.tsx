'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getBrowserClient } from '../clients/browser';
import { emailPasswordSchema } from '../utils/schemas';

type SignUpProps = {
  redirectTo?: string;
  onSuccess?: (data: { success: true; session: unknown }) => void;
  onError?: (error: Error) => void;
};

export function SignUp({ redirectTo = '/', onSuccess, onError }: SignUpProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getBrowserClient();

  function handleError(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    let userMessage = message; // Default to the raw message

    // Friendly error messages
    if (message.includes('Email already registered')) {
      userMessage =
        'This email is already registered. Please try to sign in instead.';
    } else if (message.includes('Password')) {
      userMessage = 'Please use a stronger password (min 6 characters).';
    } else if (message.includes('Invalid email')) {
      userMessage = 'Please enter a valid email address.';
    } else if (message.includes('Rate limit')) {
      userMessage = 'Too many attempts. Please try again later.';
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        throw error;
      }

      setIsLoading(false);

      // Call onSuccess if provided
      onSuccess?.({ success: true, session: data.session });

      // Auto-redirect if specified and no returnTo path
      if (redirectTo && !returnTo) {
        router.push(redirectTo);
      } else {
        // Show success message for email verification
        setError('Please check your email to verify your account.');
      }
    } catch (error) {
      handleError(error);
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <h2 className="font-bold text-3xl">Create an Account</h2>
        <p className="mt-2 text-gray-600 text-sm">
          Sign up to get started with our service
        </p>
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div
            className={`rounded-md p-4 ${error.includes('check your email') ? 'bg-green-50' : 'bg-red-50'}`}
          >
            <div
              className={`text-sm ${error.includes('check your email') ? 'text-green-700' : 'text-red-700'}`}
            >
              {error}
            </div>
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
              autoComplete="new-password"
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
            {isLoading ? 'Creating account...' : 'Sign up'}
          </button>
        </div>
      </form>
    </div>
  );
}
