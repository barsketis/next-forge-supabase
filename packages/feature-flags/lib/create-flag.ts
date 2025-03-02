import { analytics } from '@repo/analytics/posthog/server';
import { getSupabaseServerClient } from '@repo/supabase/server';
import { flag } from '@vercel/flags/next';

export const createFlag = (key: string) =>
  flag({
    key,
    defaultValue: false,
    async decide() {
      const supabase = getSupabaseServerClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;

      if (!userId) {
        return this.defaultValue as boolean;
      }

      const isEnabled = await analytics.isFeatureEnabled(key, userId);

      return isEnabled ?? (this.defaultValue as boolean);
    },
  });
