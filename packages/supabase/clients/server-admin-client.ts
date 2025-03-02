import 'server-only';

import { log } from '@repo/observability/log';
import { createClient } from '@supabase/supabase-js';

import type { Database } from '../database.types';
import { keys } from '../keys';

/**
 * @name getSupabaseServerAdminClient
 * @description Get a Supabase client for use in the Server with admin access to the database.
 */
export function getSupabaseServerAdminClient<GenericSchema = Database>() {
  if (process.env.NODE_ENV !== 'production') {
    log.warn('Using Supabase Service Role - ensure this is intentional');
  }

  const env = keys();

  return createClient<GenericSchema>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
        autoRefreshToken: false,
      },
    }
  );
}
