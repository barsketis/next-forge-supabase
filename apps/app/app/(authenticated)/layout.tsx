import { env } from '@/env';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { showBetaFeature } from '@repo/feature-flags';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { secure } from '@repo/security';
import { getSupabaseServerClient } from '@repo/supabase/server';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { PostHogIdentifier } from './components/posthog-identifier';
import { GlobalSidebar } from './components/sidebar';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const betaFeature = await showBetaFeature();

  if (!session) {
    redirect('/login');
  }

  return (
    <NotificationsProvider userId={session.user.id}>
      <SidebarProvider>
        <GlobalSidebar>
          {betaFeature && (
            <div className="m-4 rounded-full bg-success p-1.5 text-center text-sm text-success-foreground">
              Beta feature now available
            </div>
          )}
          {children}
        </GlobalSidebar>
        <PostHogIdentifier />
      </SidebarProvider>
    </NotificationsProvider>
  );
};

export default AppLayout;
