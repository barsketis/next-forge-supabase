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

  console.log('Root page authenticated, rendering content');

  // If authenticated, render the dashboard content directly
  return (
    <main>
      <h1>Redirecting to dashboard...</h1>
    </main>
  );
}
