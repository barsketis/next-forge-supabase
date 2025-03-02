import 'server-only';
import { getSupabaseServerClient } from '@repo/supabase/server';
import { Svix } from 'svix';
import { keys } from '../keys';

const svixToken = keys().SVIX_TOKEN;

export const send = async (eventType: string, payload: object) => {
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const orgId = session?.user?.id; // Using user ID as org ID for now

  if (!orgId) {
    return;
  }

  return svix.message.create(orgId, {
    eventType,
    payload: {
      eventType,
      ...payload,
    },
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};

export const getAppPortal = async () => {
  if (!svixToken) {
    throw new Error('SVIX_TOKEN is not set');
  }

  const svix = new Svix(svixToken);
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const orgId = session?.user?.id; // Using user ID as org ID for now

  if (!orgId) {
    return;
  }

  return svix.authentication.appPortalAccess(orgId, {
    application: {
      name: orgId,
      uid: orgId,
    },
  });
};
