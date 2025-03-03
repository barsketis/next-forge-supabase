'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { useToast } from '@repo/design-system/components/ui/use-toast';
import { parseError } from '@repo/observability/error';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { signInWithPassword } from '../app-router/actions/auth';
import type { AuthActionOptions, AuthResult } from '../app-router/actions/auth';

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  );
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
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  function handleError(error: unknown) {
    const message = parseError(error);

    // Map specific error messages to user-friendly messages
    let userMessage = message;
    if (message.includes('Invalid login credentials')) {
      userMessage = 'Invalid email or password';
    } else if (message.includes('Email not confirmed')) {
      userMessage = 'Please verify your email address before signing in';
    } else if (message.includes('Too many requests')) {
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
      toast({
        title: 'Error',
        description: userMessage,
        variant: 'destructive',
      });
    }

    setError(userMessage);
    onError?.(error instanceof Error ? error : new Error(message));
  }

  return (
    <form
      action={async (formData) => {
        try {
          setError(null);
          const options: AuthActionOptions = {};
          if (redirectTo) {
            options.redirectTo = redirectTo;
          }
          if (revalidatePaths) {
            options.revalidatePaths = revalidatePaths;
          }

          const result = await signInWithPassword(formData, options);
          onSuccess?.(result);

          if (!redirectTo) {
            toast({
              title: 'Success',
              description: 'You have been signed in successfully',
            });
          }
        } catch (error) {
          if (error instanceof Error && error.message !== 'NEXT_REDIRECT') {
            handleError(error);
          }
          if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
          }
        }
      }}
      className="grid gap-4"
    >
      <div className="grid gap-2">
        <Input
          id="email"
          name="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          required
        />
        <Input
          id="password"
          name="password"
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
          required
        />
        {error && (
          <div className="text-destructive text-sm">
            {error === 'Invalid login credentials'
              ? 'Invalid email or password'
              : error}
          </div>
        )}
      </div>
      <SignInButton />
    </form>
  );
}
