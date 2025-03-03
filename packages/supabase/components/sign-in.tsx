'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { signInWithPassword } from '../app-router/actions/auth';
import { useAuth } from '../app-router/hooks/use-auth';
import { signInWithEmailSchema } from '../app-router/schemas';

export type AuthResult = {
  success: true;
  session: unknown;
};

export type AuthActionOptions = {
  redirectTo?: string;
  revalidatePaths?: string[];
};

export function SignInButton() {
  return null; // Implementation as needed
}

type SignInProps = {
  redirectTo?: string;
  revalidatePaths?: string[];
  onSuccess?: (data: AuthResult) => void;
  onError?: (error: Error) => void;
};

export function SignIn({
  redirectTo,
  revalidatePaths,
  onSuccess,
  onError,
}: SignInProps = {}) {
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';
  const router = useRouter();
  const { signIn: authSignIn, isLoading, error: authError } = useAuth();

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

    // Only show toast for non-validation errors
    if (
      !message.includes('Invalid login credentials') &&
      !message.includes('Email not confirmed')
    ) {
      // Toast implementation if available
      // toast({
      //   title: 'Error',
      //   description: userMessage,
      //   variant: 'destructive',
      // });
    }

    setError(userMessage);
    onError?.(error instanceof Error ? error : new Error(message));
  }

  return (
    <form
      action={async (formData) => {
        try {
          setError(null);

          // Get form data
          const email = formData.get('email') as string;
          const password = formData.get('password') as string;

          // Validate with Zod
          signInWithEmailSchema.parse({ email, password });

          // Use the context-based signIn
          await authSignIn(email, password, {
            redirectTo: redirectTo || (returnTo ? '/' : undefined),
            returnTo,
          });

          // If we have specific paths to revalidate with server actions
          if (revalidatePaths && revalidatePaths.length > 0) {
            const options: AuthActionOptions = {};
            if (revalidatePaths) {
              options.revalidatePaths = revalidatePaths;
            }

            // Also call the server action for revalidation
            const result = await signInWithPassword(formData, options);
            onSuccess?.(result);
          }

          // Auto-redirect if specified and no returnTo path
          if (redirectTo && !returnTo) {
            router.push(redirectTo);
          }
        } catch (error) {
          handleError(error);
        }
      }}
    >
      <div className="grid gap-2">
        <div className="grid gap-1">
          <label
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="email"
          >
            Email
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="email"
            placeholder="name@example.com"
            name="email"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            required
          />
        </div>
        <div className="grid gap-1">
          <label
            className="font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            htmlFor="password"
          >
            Password
          </label>
          <input
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:font-medium file:text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            id="password"
            name="password"
            type="password"
            autoCapitalize="none"
            autoComplete="current-password"
            autoCorrect="off"
            required
          />
        </div>
        {error && <div className="text-destructive text-sm">{error}</div>}
        <button
          type="submit"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground text-sm ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>
    </form>
  );
}
