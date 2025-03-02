import { createBrowserClient } from '@supabase/ssr';

import { Database } from '../database.types';
import { keys } from '../keys';

/**
 * @name getSupabaseBrowserClient
 * @description Get a Supabase client for use in the Browser
 */
export function getSupabaseBrowserClient<GenericSchema = Database>() {
  const env = keys();

  return createBrowserClient<GenericSchema>(
    env.NEXT_PUBLIC_SUPABASE_URL, 
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
