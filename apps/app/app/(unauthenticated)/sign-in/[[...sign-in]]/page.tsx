import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const title = 'Welcome back';
const description = 'Enter your details to sign in.';
const SignInForm = dynamic(() =>
  import('@repo/supabase-auth/components').then((mod) => mod.SignInForm)
);

export const metadata: Metadata = createMetadata({ title, description });

const SignInPage = () => (
  <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
    <SignInForm
      redirectTo="/"
      revalidatePaths={['/']}
      enableGoogleSignIn={true}
      title={title}
      description={description}
    />
  </div>
);

export default SignInPage;
