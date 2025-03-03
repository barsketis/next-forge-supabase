'use server';

import { redirect } from 'next/navigation';
import { getServerClient } from '../clients/server';
import type { AuthResult } from '../types';

/**
 * Sign in a user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns AuthResult with session or error
 */
export async function signIn(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = getServerClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data.session, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error ? err : new Error('Unknown authentication error'),
    };
  }
}

/**
 * Sign up a new user with email and password
 * @param email - User's email
 * @param password - User's password
 * @returns AuthResult with session or error
 */
export async function signUp(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    const supabase = getServerClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data: null, error };
    }

    return { data: data.session, error: null };
  } catch (err) {
    return {
      data: null,
      error:
        err instanceof Error ? err : new Error('Unknown authentication error'),
    };
  }
}

/**
 * Sign out the current user
 * @param redirectUrl - URL to redirect to after sign out
 */
export async function signOut(redirectUrl = '/sign-in'): Promise<void> {
  const supabase = getServerClient();
  await supabase.auth.signOut();
  redirect(redirectUrl);
}
