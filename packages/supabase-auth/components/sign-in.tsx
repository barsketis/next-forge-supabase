'use client';

import {
  Alert,
  AlertDescription,
} from '@repo/design-system/components/ui/alert';
import { Button } from '@repo/design-system/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import {
  EnvelopeClosedIcon,
  ExclamationTriangleIcon,
  LockClosedIcon,
} from '@repo/design-system/components/ui/icons';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getBrowserClient } from '../clients/browser';
import { emailPasswordSchema, emailSchema } from '../utils/schemas';
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
  const [isResetEmailSent, setIsResetEmailSent] = useState(false);
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

  async function handlePasswordReset() {
    setIsLoading(true);
    setError(null);

    try {
      // Validate email
      emailSchema.parse({ email });

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      setIsResetEmailSent(true);
      setIsLoading(false);
    } catch (error) {
      handleError(error);
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-center">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center font-bold text-2xl">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive" className="text-sm">
                <ExclamationTriangleIcon className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {isResetEmailSent && (
              <Alert className="border-green-200 bg-green-50 text-green-800 text-sm">
                <AlertDescription>
                  Password reset email sent. Please check your inbox.
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-medium text-sm">
                Email
              </Label>
              <div className="relative">
                <EnvelopeClosedIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-medium text-sm">
                  Password
                </Label>
                <button
                  type="button"
                  className="text-primary text-xs hover:underline"
                  onClick={handlePasswordReset}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <LockClosedIcon className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              variant="default"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>

            <p className="text-center text-muted-foreground text-sm">
              Don't have an account?{' '}
              <Link
                href="/auth/sign-up"
                className="text-primary hover:underline"
              >
                Create an account
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
