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
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { log } from '@repo/observability/log';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getBrowserClient } from '../clients/browser';
import { emailPasswordSchema } from '../utils/schemas';
import { useAuth } from './AuthProvider';

// Import icons directly from radix-ui to avoid the import error
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

type SignInProps = {
  redirectTo?: string;
  revalidatePaths?: string[];
  onSuccess?: (data: { success: true; session: unknown }) => void;
  onError?: (error: Error) => void;
  enableGoogleSignIn?: boolean;
  title?: string;
  description?: string;
};

export function SignIn({
  redirectTo = '/',
  revalidatePaths = [],
  onSuccess,
  onError,
  enableGoogleSignIn = false,
  title = 'Welcome back',
  description = 'Sign in to your account to continue',
}: SignInProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getBrowserClient();
  const { error: authError } = useAuth();

  const handleError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      let userMessage = message;

      if (message.includes('Invalid login credentials')) {
        userMessage = 'The email or password you entered is incorrect';
      } else if (message.includes('Email not confirmed')) {
        userMessage = 'Please check your email to confirm your account';
      } else if (message.includes('Rate limit')) {
        userMessage = 'Too many sign in attempts. Please try again later';
      } else if (message.includes('Network')) {
        userMessage =
          'Unable to connect. Please check your internet connection';
      } else if (message.includes('User not found')) {
        userMessage = 'No account found with this email address';
      } else if (message.includes('Account locked')) {
        userMessage = 'Your account has been locked. Please contact support';
      }

      log.error('Sign in failed', {
        event: 'sign_in_failed',
        error: message,
        email: email.toLowerCase(),
      });

      setError(userMessage);
      onError?.(error instanceof Error ? error : new Error(message));
    },
    [onError, email]
  );

  // If there's an auth error from the context, show it
  useEffect(() => {
    if (authError) {
      handleError(authError);
    }
  }, [authError, handleError]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      emailPasswordSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      log.info('User signed in successfully', {
        event: 'sign_in_success',
        email: email.toLowerCase(),
      });

      if (revalidatePaths.length > 0) {
        for (const path of revalidatePaths) {
          router.refresh();
        }
      }

      onSuccess?.({ success: true, session: data.session });

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

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?returnTo=${returnTo || redirectTo}`,
        },
      });

      if (error) {
        throw error;
      }

      log.info('Google sign in initiated', {
        event: 'google_sign_in_initiated',
      });
    } catch (error) {
      log.error('Google sign in failed', {
        event: 'google_sign_in_failed',
        error: error instanceof Error ? error.message : String(error),
      });
      handleError(error);
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md items-center justify-center">
      <Card className="w-full shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center font-bold text-2xl">
            {title}
          </CardTitle>
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="text-sm">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {enableGoogleSignIn && (
            <>
              <Button
                type="button"
                variant="outline"
                className="flex w-full items-center justify-center gap-2"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-medium text-sm">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="font-medium text-sm">
                    Password
                  </Label>
                  <Link
                    href="/forgot-password"
                    className="text-primary text-xs hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                variant="default"
                size="lg"
              >
                {isLoading ? 'Signing in...' : 'Sign in with Email'}
              </Button>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-center text-muted-foreground text-sm">
            Don't have an account?{' '}
            <Link href="/sign-up" className="text-primary hover:underline">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
