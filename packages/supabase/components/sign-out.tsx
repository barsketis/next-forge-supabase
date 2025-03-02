'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { useToast } from '@repo/design-system/components/ui/use-toast';
import { parseError } from '@repo/observability/error';
import { useFormStatus } from 'react-dom';
import { signOut } from '../actions/auth';

function SignOutButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" variant="ghost" disabled={pending}>
      {pending ? 'Signing out...' : 'Sign out'}
    </Button>
  );
}

export function SignOut() {
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
      action={async () => {
        try {
          await signOut();
        } catch (error) {
          handleError(error);
        }
      }}
    >
      <SignOutButton />
    </form>
  );
}
