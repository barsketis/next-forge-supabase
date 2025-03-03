import { z } from 'zod';

/**
 * Validation schema for email and password sign-in/sign-up
 */
export const emailPasswordSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password must be less than 72 characters'),
});

/**
 * Validation schema for email only
 */
export const emailSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
});
