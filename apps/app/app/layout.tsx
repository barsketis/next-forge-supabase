import '@repo/design-system/styles/globals.css';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { AuthProvider } from '@repo/supabase-auth/components/AuthProvider';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html lang="en" className={fonts} suppressHydrationWarning>
    <body>
      <DesignSystemProvider>
        <AuthProvider>{children}</AuthProvider>
      </DesignSystemProvider>
      <Toolbar />
    </body>
  </html>
);

export default RootLayout;
