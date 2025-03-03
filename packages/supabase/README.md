# Supabase Package

This package provides Supabase integration for Next.js applications in our monorepo.

## Structure

```
packages/supabase/
├── app-router/        # Next.js App Router specific code
│   ├── actions/      # Server Actions (use with 'use server')
│   ├── hooks/        # Hooks for App Router components
│   └── server-client.ts
├── clients/          # Base client implementations
└── server.ts         # Main server exports
```

## Usage

### App Router (Next.js 13+)
```typescript
// Server Components / Actions
import { getSupabaseAppServerClient } from '@repo/supabase/app-router/server-client';

// Client Components
import { useSession } from '@repo/supabase/app-router/hooks/use-session';
```

### Pages Router or Middleware
```typescript
import { getSupabaseServerClient } from '@repo/supabase/server';
```

## Migration

If you're using old imports from `actions/` or `hooks/`, migrate them to the appropriate App Router imports. The base directories are being deprecated in favor of the new structure. 