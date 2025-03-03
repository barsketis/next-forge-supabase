'use client';

import { getSupabaseBrowserClient } from '@repo/supabase/clients/browser-client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function SignOutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();

      // Sign out the user
      await supabase.auth.signOut();

      // Refresh the page to trigger a redirect to the sign-in page
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isLoading}
      className="rounded-md bg-red-600 px-4 py-2 font-medium text-sm text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
