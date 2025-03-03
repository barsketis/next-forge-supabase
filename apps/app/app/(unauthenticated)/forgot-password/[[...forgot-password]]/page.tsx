import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const title = 'Forgot Password';
const description = 'Reset your password to regain access to your account.';
const ForgotPassword = dynamic(() =>
  import('@repo/supabase-auth/components').then((mod) => mod.ForgotPassword)
);

export const metadata: Metadata = createMetadata({ title, description });

const ResetPasswordPage = () => (
  <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
    <ForgotPassword
      redirectTo="/sign-in"
      title={title}
      description={description}
    />
  </div>
);

export default ResetPasswordPage;
