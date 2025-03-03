import '@repo/design-system/styles/globals.css';
import './styles/web.css';
import { Toolbar as CMSToolbar } from '@repo/cms/components/toolbar';
import { DesignSystemProvider } from '@repo/design-system';
import { fonts } from '@repo/design-system/lib/fonts';
import { cn } from '@repo/design-system/lib/utils';
import { Toolbar } from '@repo/feature-flags/components/toolbar';
import { AuthProvider } from '@repo/supabase-auth/components';
import type { ReactNode } from 'react';
import { Footer } from './components/footer';
import { Header } from './components/header';

type RootLayoutProperties = {
  readonly children: ReactNode;
};

const RootLayout = ({ children }: RootLayoutProperties) => (
  <html
    lang="en"
    className={cn(fonts, 'scroll-smooth')}
    suppressHydrationWarning
  >
    <body>
      <AuthProvider>
        <DesignSystemProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </DesignSystemProvider>
      </AuthProvider>
      <div className="fixed right-0 bottom-0 z-50">
        <Toolbar />
        <CMSToolbar />
      </div>
    </body>
  </html>
);

export default RootLayout;
