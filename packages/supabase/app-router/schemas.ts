import { z } from 'zod';

// Basic Authentication
export const signInWithEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignInWithEmailParams = z.infer<typeof signInWithEmailSchema>;

export const signUpWithEmailSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type SignUpWithEmailParams = z.infer<typeof signUpWithEmailSchema>;

// OAuth Authentication
export const signInWithProviderSchema = z.object({
  provider: z.string(),
  options: z.object({}).optional(),
});

export type SignInWithProviderParams = z.infer<typeof signInWithProviderSchema>;

// OTP Authentication
export const signInWithOtpSchema = z.object({
  email: z.string().email(),
  options: z
    .object({
      emailRedirectTo: z.string().optional(),
      shouldCreateUser: z.boolean().optional(),
      data: z.record(z.any()).optional(),
    })
    .optional(),
});

export type SignInWithOtpParams = z.infer<typeof signInWithOtpSchema>;

export const verifyOtpSchema = z.object({
  type: z.enum(['email', 'phone', 'totp']),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  token: z.string(),
});

export type VerifyOtpParams = z.infer<typeof verifyOtpSchema>;

// Password Reset
export const requestPasswordResetSchema = z.object({
  email: z.string().email(),
  redirectTo: z.string().optional(),
  captchaToken: z.string().optional(),
});

export type RequestPasswordResetParams = z.infer<
  typeof requestPasswordResetSchema
>;
