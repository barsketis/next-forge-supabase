'use server';

import { getServerClient } from '@repo/supabase-auth/clients/server';
import Fuse from 'fuse.js';

export const searchUsers = async (
  query: string
): Promise<
  | {
      data: string[];
    }
  | {
      error: unknown;
    }
> => {
  try {
    const supabase = getServerClient();
    const { data: session } = await supabase.auth.getSession();

    if (!session.session?.user) {
      throw new Error('Not logged in');
    }

    // Get all users in the organization
    const {
      data: { users },
      error,
    } = await supabase.auth.admin.listUsers();

    if (error) {
      throw error;
    }

    const fuse = new Fuse(users ?? [], {
      keys: ['email'],
      minMatchCharLength: 1,
      threshold: 0.3,
    });

    const results = fuse.search(query);
    const data = results.map((result) => result.item.id);

    return { data };
  } catch (error) {
    return { error };
  }
};
