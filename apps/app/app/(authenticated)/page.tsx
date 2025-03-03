import { database } from '@repo/database';
import { getSupabaseAppServerClient } from '@repo/supabase/app-router';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { Header } from './components/header';

const title = 'Acme Inc';
const description = 'My application.';

const CollaborationProvider = dynamic(() =>
  import('./components/collaboration-provider').then(
    (mod) => mod.CollaborationProvider
  )
);

export const metadata: Metadata = {
  title,
  description,
};

const App = async () => {
  console.log('Authenticated page rendering');

  const pages = await database.page.findMany();
  const supabase = await getSupabaseAppServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const orgId = session?.user?.id; // Using user ID as org ID for now

  console.log('Authenticated page session status:', !!session);

  if (!session) {
    console.log('Authenticated page - no session found');
    return null;
  }

  console.log('Authenticated page rendering content');

  return (
    <>
      <Header pages={['Building Your Application']} page="Data Fetching">
        {/* {env.LIVEBLOCKS_SECRET && (
          <CollaborationProvider orgId={orgId}>
            <AvatarStack />
            <Cursors />
          </CollaborationProvider>
        )} */}
      </Header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {pages.map((page) => (
            <div key={page.id} className="aspect-video rounded-xl bg-muted/50">
              {page.name}
            </div>
          ))}
        </div>
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
      </div>
    </>
  );
};

export default App;
