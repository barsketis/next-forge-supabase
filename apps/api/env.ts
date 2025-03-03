import { keys as analytics } from '@repo/analytics/keys';
import { keys as database } from '@repo/database/keys';
import { keys as email } from '@repo/email/keys';
import { keys as core } from '@repo/next-config/keys';
import { keys as observability } from '@repo/observability/keys';
import { keys as payments } from '@repo/payments/keys';
import { keys as supabase } from '@repo/supabase-auth/keys';
import { createEnv } from '@t3-oss/env-nextjs';

export const env = createEnv({
  extends: [
    analytics(),
    core(),
    database(),
    email(),
    observability(),
    payments(),
    supabase(),
  ],
  server: {},
  client: {},
  runtimeEnv: {},
});
