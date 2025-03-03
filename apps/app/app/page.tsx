import { getSupabaseAppServerClient } from '@repo/supabase/app-router';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  console.log('Root page rendering');

  const supabase = await getSupabaseAppServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  console.log('Root page session status:', !!session);

  // If not authenticated, redirect to sign-in
  if (!session) {
    console.log('Root page redirecting to sign-in');
    redirect('/sign-in');
  }

  // If authenticated, redirect to dashboard
  console.log('Root page authenticated, redirecting to dashboard');
  redirect('/dashboard');

  // This code won't execute due to the redirect above
  return null;
}
