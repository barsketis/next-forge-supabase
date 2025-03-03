import { env } from '@/env';
import { SidebarProvider } from '@repo/design-system/components/ui/sidebar';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { secure } from '@repo/security';
import { requireUser } from '@repo/supabase-auth';
import { getServerClient } from '@repo/supabase-auth/clients/server';
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

  const supabase = await getServerClient();
  const { data: user } = await requireUser(supabase);

  if (!user) {
    redirect('/sign-in');
  }

  return (
    <NotificationsProvider userId={user.id}>
      <SidebarProvider>
        <GlobalSidebar>{children}</GlobalSidebar>
        <PostHogIdentifier />
      </SidebarProvider>
    </NotificationsProvider>
  );
};

export default AppLayout;
