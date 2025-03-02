'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { useToast } from '@repo/design-system/components/ui/use-toast';
import { parseError } from '@repo/observability/error';
import { useFormStatus } from 'react-dom';
import { signInWithPassword } from '../actions/auth';

function SignInButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'Signing in...' : 'Sign in'}
    </Button>
  );
}

export function SignIn() {
  const { toast } = useToast();

  function handleError(error: unknown) {
    const message = parseError(error);
    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    });
  }

  return (
    <form
      action={async (formData) => {
        try {
          await signInWithPassword(formData);
        } catch (error) {
          handleError(error);
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
      </div>
      <SignInButton />
    </form>
  );
}
