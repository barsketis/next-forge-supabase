import { getServerClient } from '@repo/supabase-auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const supabase = await getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // If not authenticated, redirect to sign-in
  if (!session) {
    redirect('/sign-in');
  }

  // If authenticated, redirect to dashboard
  redirect('/dashboard');

  // This code won't execute due to the redirect above
  return null;
}
