import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const title = 'Create an account';
const description = 'Enter your details to sign up.';
const SignUpForm = dynamic(() =>
  import('@repo/supabase-auth/components').then((mod) => mod.SignUp)
);

export const metadata: Metadata = createMetadata({ title, description });

const SignUpPage = () => (
  <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
    <SignUpForm
      redirectTo="/"
      revalidatePaths={['/']}
      enableGoogleSignIn={true}
      title={title}
      description={description}
    />
  </div>
);

export default SignUpPage;
