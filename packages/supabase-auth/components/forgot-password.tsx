'use client';

import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
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
import type React from 'react';
import { useCallback, useState } from 'react';
import { getBrowserClient } from '../clients/browser';
import { emailSchema } from '../utils/schemas';

type ForgotPasswordProps = {
  redirectTo?: string;
  onSuccess?: (data: { success: true }) => void;
  onError?: (error: Error) => void;
  title?: string;
  description?: string;
};

export function ForgotPassword({
  redirectTo = '/auth/sign-in',
  onSuccess,
  onError,
  title = 'Reset your password',
  description = 'Enter your email address and we will send you a reset link',
}: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const supabase = getBrowserClient();

  const handleError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      let userMessage = message;

      if (message.includes('User not found')) {
        userMessage = 'No account found with this email address';
      } else if (message.includes('Rate limit')) {
        userMessage = 'Too many attempts. Please try again later';
      } else if (message.includes('Network')) {
        userMessage =
          'Unable to connect. Please check your internet connection';
      } else if (message.includes('Invalid email')) {
        userMessage = 'Please enter a valid email address';
      }

      log.error('Password reset request failed', {
        event: 'password_reset_request_failed',
        error: message,
        email: email.toLowerCase(),
      });

      setError(userMessage);
      onError?.(error instanceof Error ? error : new Error(message));
    },
    [onError, email]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      emailSchema.parse({ email });

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password?redirectTo=${redirectTo}`,
      });

      if (error) {
        throw error;
      }

      log.info('Password reset email sent', {
        event: 'password_reset_email_sent',
        email: email.toLowerCase(),
      });

      setIsEmailSent(true);
      setIsLoading(false);
      onSuccess?.({ success: true });
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

          {isEmailSent ? (
            <Alert variant="default" className="text-sm">
              <AlertDescription>
                Check your email for a password reset link. If you don't see it,
                check your spam folder.
              </AlertDescription>
            </Alert>
          ) : (
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

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  variant="default"
                  size="lg"
                >
                  {isLoading ? 'Sending reset link...' : 'Send reset link'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center">
          <p className="text-center text-muted-foreground text-sm">
            Remember your password?{' '}
            <Link href="/sign-in" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
