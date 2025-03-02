import { z } from 'zod';

// Basic Auth Schemas
export const emailSchema = z.string().email();
export const passwordSchema = z.string().min(6);
export const captchaTokenSchema = z.string().optional();
export const redirectToSchema = z.string().url().optional();

export const signInWithEmailSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  options: z
    .object({
      redirectTo: redirectToSchema,
      captchaToken: captchaTokenSchema,
    })
    .optional(),
});

export const signUpWithEmailSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  options: z
    .object({
      data: z.record(z.string(), z.unknown()).optional(),
      emailRedirectTo: redirectToSchema,
      captchaToken: captchaTokenSchema,
    })
    .optional(),
});

// OAuth Schema
export const providerSchema = z.enum([
  'apple',
  'azure',
  'bitbucket',
  'discord',
  'facebook',
  'github',
  'gitlab',
  'google',
  'keycloak',
  'linkedin',
  'notion',
  'slack',
  'spotify',
  'twitch',
  'twitter',
  'workos',
]);

export const signInWithProviderSchema = z.object({
  provider: providerSchema,
  options: z
    .object({
      redirectTo: redirectToSchema,
      scopes: z.string().optional(),
      queryParams: z.record(z.string(), z.string()).optional(),
      skipBrowserRedirect: z.boolean().optional(),
    })
    .optional(),
});

// OTP Schemas
export const signInWithOtpSchema = z.object({
  email: emailSchema,
  options: z
    .object({
      emailRedirectTo: redirectToSchema,
      captchaToken: captchaTokenSchema,
    })
    .optional(),
});

export const emailOtpTypeSchema = z.enum([
  'signup',
  'invite',
  'magiclink',
  'recovery',
  'email_change',
]);

export const verifyOtpSchema = z.object({
  email: emailSchema,
  token: z.string(),
  type: emailOtpTypeSchema,
});

// Password Reset Schema
export const requestPasswordResetSchema = z.object({
  email: emailSchema,
  redirectTo: z.string().url(),
  captchaToken: captchaTokenSchema,
});

// User Management Schemas
export const userAttributesSchema = z.object({
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  email_confirm: z.boolean().optional(),
  phone: z.string().optional(),
  phone_confirm: z.boolean().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
});

export const userIdSchema = z.string().uuid();

// Types
export type SignInWithEmailParams = z.infer<typeof signInWithEmailSchema>;
export type SignUpWithEmailParams = z.infer<typeof signUpWithEmailSchema>;
export type SignInWithProviderParams = z.infer<typeof signInWithProviderSchema>;
export type SignInWithOtpParams = z.infer<typeof signInWithOtpSchema>;
export type VerifyOtpParams = z.infer<typeof verifyOtpSchema>;
export type RequestPasswordResetParams = z.infer<
  typeof requestPasswordResetSchema
>;
export type UserAttributes = z.infer<typeof userAttributesSchema>;
