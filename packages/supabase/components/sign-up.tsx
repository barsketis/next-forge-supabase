'use client';

import { Button } from '@repo/design-system/components/ui/button';
import { Input } from '@repo/design-system/components/ui/input';
import { useToast } from '@repo/design-system/components/ui/use-toast';
import { parseError } from '@repo/observability/error';
import { useRouter } from 'next/navigation';
import { useSignUpWithEmailAndPassword } from '../hooks/use-sign-up-with-email-password';
import { signUpSchema } from '../schemas';

export function SignUp() {
  const { signUp, isPending } = useSignUpWithEmailAndPassword();
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Get the current URL and replace the path with /auth/callback
    const url = new URL(window.location.href);
    url.pathname = '/auth/callback';

    try {
      // Validate inputs before sending to the server
      signUpSchema.parse({
        email,
        password,
        emailRedirectTo: url.toString(),
      });

      await signUp({
        email,
        password,
        emailRedirectTo: url.toString(),
      });
      router.push('/');
      toast({
        title: 'Success',
        description: 'Please check your email to confirm your account.',
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
          autoComplete="new-password"
          required
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
}
