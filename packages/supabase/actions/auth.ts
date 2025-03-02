'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSupabaseServerClient } from '../clients/server-client';
import {
  type RequestPasswordResetParams,
  type SignInWithEmailParams,
  type SignInWithOtpParams,
  type SignInWithProviderParams,
  type SignUpWithEmailParams,
  type VerifyOtpParams,
  requestPasswordResetSchema,
  signInWithEmailSchema,
  signInWithOtpSchema,
  signInWithProviderSchema,
  signUpWithEmailSchema,
  verifyOtpSchema,
} from './schemas';

// Basic Authentication
export async function signInWithPassword(formData: FormData) {
  const supabase = getSupabaseServerClient();

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
  const supabase = getSupabaseServerClient();
  const validatedData = signInWithEmailSchema.parse(params);
  const { error } = await supabase.auth.signInWithPassword(validatedData);

  if (error) {
    throw error;
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function signUp(formData: FormData) {
  const supabase = getSupabaseServerClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const validatedData = signUpWithEmailSchema.parse(data);
  const { error } = await supabase.auth.signUp(validatedData);

  if (error) {
    redirect('/error');
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function signUpWithEmail(params: SignUpWithEmailParams) {
  const supabase = getSupabaseServerClient();
  const validatedData = signUpWithEmailSchema.parse(params);
  const { error } = await supabase.auth.signUp(validatedData);

  if (error) {
    throw error;
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

// OAuth Authentication
export async function signInWithProvider(
  credentials: SignInWithProviderParams
) {
  const supabase = getSupabaseServerClient();
  const validatedData = signInWithProviderSchema.parse(credentials);
  const response = await supabase.auth.signInWithOAuth(validatedData);

  if (response.error) {
    throw response.error;
  }

  revalidatePath('/', 'layout');
  return response.data;
}

// OTP Authentication
export async function signInWithOtp(credentials: SignInWithOtpParams) {
  const supabase = getSupabaseServerClient();
  const validatedData = signInWithOtpSchema.parse(credentials);
  const result = await supabase.auth.signInWithOtp(validatedData);

  if (result.error) {
    throw result.error;
  }

  revalidatePath('/', 'layout');
  return result.data;
}

export async function verifyOtp(params: VerifyOtpParams) {
  const supabase = getSupabaseServerClient();
  const validatedData = verifyOtpSchema.parse(params);
  const { data, error } = await supabase.auth.verifyOtp(validatedData);

  if (error) {
    throw error;
  }

  revalidatePath('/', 'layout');
  return data;
}

// Session Management
export async function signOut() {
  const supabase = getSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}

export async function getSession() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

// Password Reset
export async function requestPasswordReset(params: RequestPasswordResetParams) {
  const supabase = getSupabaseServerClient();
  const validatedData = requestPasswordResetSchema.parse(params);
  const { error, data } = await supabase.auth.resetPasswordForEmail(
    validatedData.email,
    {
      redirectTo: validatedData.redirectTo,
      captchaToken: validatedData.captchaToken,
    }
  );

  if (error) {
    throw error;
  }

  return data;
}

// MFA Management
export async function fetchMfaFactors(userId: string) {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase.auth.mfa.listFactors();

  if (error) {
    throw error;
  }

  return data;
}
