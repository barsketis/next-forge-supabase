'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { useToast } from '@repo/design-system/components/ui/use-toast';
import { parseError } from '@repo/observability/error';
import { useRouter } from 'next/navigation';
import { useSignInWithEmailPassword } from '../hooks/use-sign-in-with-email-password';

export function SignIn() {
  const { mutate: signIn, isLoading } = useSignInWithEmailPassword();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      await signIn({ email, password });
      router.push('/');
      toast({
        title: 'Success',
        description: 'You have been signed in.',
      });
    } catch (error) {
      const message = parseError(error);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
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
      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
