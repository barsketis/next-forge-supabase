import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

/**
 * Environment variable validation using zod
 * This ensures our app has the correct environment variables at runtime
 */
export const keys = () =>
  createEnv({
    server: {
      SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    },
    client: {
      NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    },
    runtimeEnv: {
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    },
  });
