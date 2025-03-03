import { authenticate } from '@repo/collaboration/auth';
import { getServerClient } from '@repo/supabase-auth/clients';
import { tailwind } from '@repo/tailwind-config';

const COLORS = [
  tailwind.theme.colors.red[500],
  tailwind.theme.colors.orange[500],
  tailwind.theme.colors.amber[500],
  tailwind.theme.colors.yellow[500],
  tailwind.theme.colors.lime[500],
  tailwind.theme.colors.green[500],
  tailwind.theme.colors.emerald[500],
  tailwind.theme.colors.teal[500],
  tailwind.theme.colors.cyan[500],
  tailwind.theme.colors.sky[500],
  tailwind.theme.colors.blue[500],
  tailwind.theme.colors.indigo[500],
  tailwind.theme.colors.violet[500],
  tailwind.theme.colors.purple[500],
  tailwind.theme.colors.fuchsia[500],
  tailwind.theme.colors.pink[500],
  tailwind.theme.colors.rose[500],
];

export const POST = async () => {
  const supabase = getServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;
  const orgId = user?.id; // Using user ID as org ID for now

  if (!user || !orgId) {
    return new Response('Unauthorized', { status: 401 });
  }

  return authenticate({
    userId: user.id,
    orgId,
    userInfo: {
      name: user.email ?? undefined,
      avatar: undefined, // No avatar in Supabase by default
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    },
  });
};
