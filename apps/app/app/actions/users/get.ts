'use server';

import { getSupabaseServerClient } from '@repo/supabase/server';
import type { User } from '@supabase/supabase-js';
import { tailwind } from '@repo/tailwind-config';

const colors = [
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

export const getUsers = async (
  userIds: string[]
): Promise<
  | {
      data: Liveblocks['UserMeta']['info'][];
    }
  | {
      error: unknown;
    }
> => {
  try {
    const supabase = getSupabaseServerClient();
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      throw new Error('Not logged in');
    }

    // Get all users from the requested IDs
    const users: User[] = [];
    for (const id of userIds) {
      const { data: { user } } = await supabase.auth.admin.getUserById(id);
      if (user) {
        users.push(user);
      }
    }

    const data = users.map((user) => ({
      name: user.email ?? 'Unknown user',
      picture: '', // No avatar URL in Supabase by default
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    return { data };
  } catch (error) {
    return { error };
  }
};
