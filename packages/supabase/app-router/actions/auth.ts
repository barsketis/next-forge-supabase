'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { type SignInWithEmailParams, signInWithEmailSchema } from '../schemas';
import { getSupabaseAppServerClient } from '../server-client';

// Basic Authentication
export async function signInWithPassword(formData: FormData) {
  const supabase = await getSupabaseAppServerClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedData = signInWithEmailSchema.parse(data);
  const { error } = await supabase.auth.signInWithPassword(validatedData);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signInWithEmail(params: SignInWithEmailParams) {
  const supabase = await getSupabaseAppServerClient();
  const validatedData = signInWithEmailSchema.parse(params);
  const { error } = await supabase.auth.signInWithPassword(validatedData);

  if (error) {
    throw error;
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signOut() {
  const supabase = await getSupabaseAppServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  revalidatePath('/', 'layout');
  redirect('/sign-in');
}

export async function signUp(formData: FormData) {
  const supabase = await getSupabaseAppServerClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signUp(data);

  if (error) {
    throw error;
  }

  return { success: true };
}
