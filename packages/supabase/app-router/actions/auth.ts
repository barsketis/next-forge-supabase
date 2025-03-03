'use server';

import type { Session } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type SignInWithEmailParams, signInWithEmailSchema } from '../schemas';
import { getSupabaseAppServerClient } from '../server-client';

export type AuthActionOptions = {
  redirectTo?: string;
  revalidatePaths?: string[];
};

export type AuthResult = {
  success: true;
  session: Session | null;
};

// Basic Authentication
export async function signInWithPassword(
  formData: FormData,
  options?: AuthActionOptions
): Promise<AuthResult> {
  const supabase = await getSupabaseAppServerClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedData = signInWithEmailSchema.parse(data);
  const { data: signInData, error } =
    await supabase.auth.signInWithPassword(validatedData);

  if (error) {
    throw error;
  }

  if (!signInData.session) {
    throw new Error('Failed to establish session');
  }

  // Revalidate specified paths or default to root layout
  if (options?.revalidatePaths) {
    for (const path of options.revalidatePaths) {
      revalidatePath(path);
    }
  } else {
    revalidatePath('/', 'layout');
  }

  // Only redirect if a path is specified
  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }

  return { success: true as const, session: signInData.session };
}

export async function signInWithEmail(
  params: SignInWithEmailParams,
  options?: AuthActionOptions
): Promise<AuthResult> {
  const supabase = await getSupabaseAppServerClient();
  const validatedData = signInWithEmailSchema.parse(params);
  const { data: signInData, error } =
    await supabase.auth.signInWithPassword(validatedData);

  if (error) {
    throw error;
  }

  if (options?.revalidatePaths) {
    for (const path of options.revalidatePaths) {
      revalidatePath(path);
    }
  } else {
    revalidatePath('/', 'layout');
  }

  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }

  return { success: true as const, session: signInData.session };
}

export async function signOut(
  options?: AuthActionOptions
): Promise<{ success: true }> {
  const supabase = await getSupabaseAppServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  if (options?.revalidatePaths) {
    for (const path of options.revalidatePaths) {
      revalidatePath(path);
    }
  } else {
    revalidatePath('/', 'layout');
  }

  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }

  return { success: true as const };
}

export async function signUp(
  formData: FormData,
  options?: AuthActionOptions
): Promise<AuthResult> {
  const supabase = await getSupabaseAppServerClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    throw error;
  }

  if (options?.revalidatePaths) {
    for (const path of options.revalidatePaths) {
      revalidatePath(path);
    }
  }

  if (options?.redirectTo) {
    redirect(options.redirectTo);
  }

  return { success: true as const, session: signUpData.session };
}
