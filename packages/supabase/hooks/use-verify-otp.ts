import type { VerifyOtpParams } from '@supabase/supabase-js';

import { useSupabase } from './use-supabase';

/**
 * @name useVerifyOtp
 * @description Use Supabase to verify an OTP in a React component
 */
export function useVerifyOtp() {
  const client = useSupabase();

  const verifyOtp = async (params: VerifyOtpParams) => {
    const { data, error } = await client.auth.verifyOtp(params);

    if (error) {
      throw error;
    }

    return data;
  };

  return { verifyOtp };
}
