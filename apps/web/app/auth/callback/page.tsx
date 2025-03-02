'use server';

import { getSupabaseServerClient } from '@repo/supabase/clients/server-client';
import { createAuthCallbackService } from '@repo/supabase/auth';
import { redirect } from 'next/navigation';

export default async function AuthCallback(request: Request) {
  const supabase = getSupabaseServerClient();
  const authCallbackService = createAuthCallbackService(supabase);

  const { nextPath } = await authCallbackService.exchangeCodeForSession(request, {
    redirectPath: '/dashboard',
    errorPath: '/auth/error',
  });

  redirect(nextPath);
} 