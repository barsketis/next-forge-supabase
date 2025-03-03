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
  CardHeader,
  CardTitle,
} from '@repo/design-system/components/ui/card';
import { Input } from '@repo/design-system/components/ui/input';
import { Label } from '@repo/design-system/components/ui/label';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import type React from 'react';
import { getBrowserClient } from '../clients/browser';
import { passwordSchema } from '../utils/schemas';

type UpdatePasswordProps = {
  redirectTo?: string;
  onSuccess?: (data: { success: true }) => void;
  onError?: (error: Error) => void;
  title?: string;
  description?: string;
};

export function UpdatePasswordForm({
  redirectTo = '/auth/sign-in',
  onSuccess,
  onError,
  title = 'Update password',
  description = 'Enter your new password below',
}: UpdatePasswordProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('redirectTo') || redirectTo;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = getBrowserClient();

  const handleError = useCallback(
    (error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      let userMessage = message;

      if (message.includes('Password')) {
        userMessage = 'Please use a stronger password (min 6 characters)';
      } else if (message.includes('Rate limit')) {
        userMessage = 'Too many attempts. Please try again later';
      } else if (message.includes('Network')) {
        userMessage =
          'Unable to connect. Please check your internet connection';
      } else if (message.includes('expired')) {
        userMessage =
          'Password reset link has expired. Please request a new one';
      }

      setError(userMessage);
      onError?.(error instanceof Error ? error : new Error(message));
    },
    [onError]
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      passwordSchema.parse(password);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw error;
      }

      setIsLoading(false);
      onSuccess?.({ success: true });
      router.push(returnTo);
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

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="font-medium text-sm">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="confirmPassword"
                  className="font-medium text-sm"
                >
                  Confirm Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                {isLoading ? 'Updating password...' : 'Update password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
