'use client';

import { ExitIcon } from '@radix-ui/react-icons';
import { Button } from '@repo/design-system/components/ui/button';
import { cn } from '@repo/design-system/lib/utils';
import { parseError } from '@repo/observability/error';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { getBrowserClient } from '../clients/browser';

interface SignOutProps {
  className?: string;
  redirectUrl?: string;
}

export function SignOut({ className, redirectUrl = '/sign-in' }: SignOutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      router.push(redirectUrl);
    } catch (error) {
      parseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleSignOut}
      disabled={isLoading}
      className={cn('w-full gap-2 hover:bg-muted', className)}
    >
      <ExitIcon className="h-4 w-4" />
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </Button>
  );
}
