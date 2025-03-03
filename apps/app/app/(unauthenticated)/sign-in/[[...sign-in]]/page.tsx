import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const title = 'Welcome back';
const description = 'Enter your details to sign in.';
const SignIn = dynamic(() =>
  import('@repo/supabase-auth/components').then((mod) => mod.SignIn)
);

export const metadata: Metadata = createMetadata({ title, description });

export default function SignInPage({
  searchParams,
}: {
  searchParams?: { returnTo?: string };
}) {
  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <SignIn
        redirectTo={searchParams?.returnTo || '/'}
        revalidatePaths={['/']}
        enableGoogleSignIn={true}
        title={title}
        description={description}
      />
    </div>
  );
}
