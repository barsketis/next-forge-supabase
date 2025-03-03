import { database } from '@repo/database';
import { parseError } from '@repo/observability/error';
import { log } from '@repo/observability/log';
import { getServerClient } from '@repo/supabase-auth/clients/server';
import type { Metadata } from 'next';
import { Header } from './components/header';

const title = 'Acme Inc';
const description = 'My application.';

// const CollaborationProvider = dynamic(() =>
//   import('./components/collaboration-provider').then(
//     (mod) => mod.CollaborationProvider
//   )
// );

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  const supabase = getServerClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      log.warn('No authenticated user found');
      // You might want to redirect to login or handle this case differently
    }

    try {
      const pages = await database.page.findMany();

      return (
        <>
          <Header pages={['Building Your Application']} page="Data Fetching" />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="aspect-video rounded-xl bg-muted/50"
                >
                  {page.name}
                </div>
              ))}
            </div>
            <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
          </div>
        </>
      );
    } catch (dbError) {
      log.error('Database error occurred', { error: parseError(dbError) });
      throw new Error('Failed to fetch pages from database');
    }
  } catch (authError) {
    log.error('Authentication error occurred', {
      error: parseError(authError),
    });
    throw new Error('Authentication failed');
  }
};

export default App;
