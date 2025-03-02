'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseServerClient } from '../clients/server-client';
import {
  type UserAttributes,
  userAttributesSchema,
  userIdSchema,
} from './schemas';

export async function updateUser(attributes: UserAttributes) {
  const supabase = getSupabaseServerClient();
  const validatedData = userAttributesSchema.parse(attributes);
  const { data: user, error } = await supabase.auth.updateUser(validatedData);

  if (error) {
    throw error;
  }

  revalidatePath('/', 'layout');
  return user;
}

export async function getUser() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return user;
}

export async function getUserById(userId: string) {
  const supabase = getSupabaseServerClient();
  const validatedId = userIdSchema.parse(userId);
  const { data: user, error } =
    await supabase.auth.admin.getUserById(validatedId);

  if (error) {
    throw error;
  }

  return user;
}
