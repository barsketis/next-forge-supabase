'use client';

import { useAnalytics } from '@repo/analytics/posthog/client';
import { useSession } from '@repo/supabase/app-router/hooks/use-session';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

export const PostHogIdentifier = () => {
  const { session } = useSession();
  const identified = useRef(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const analytics = useAnalytics();

  useEffect(() => {
    // Track pageviews
    if (pathname && analytics) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = `${url}?${searchParams.toString()}`;
      }
      analytics.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams, analytics]);

  useEffect(() => {
    if (!session?.user || identified.current) {
      return;
    }

    analytics.identify(session.user.id, {
      email: session.user.email,
      created_at: session.user.created_at,
    });

    identified.current = true;
  }, [session, analytics]);

  return null;
};
