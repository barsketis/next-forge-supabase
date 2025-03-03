# Supabase Auth

A modern Supabase authentication package for Next.js applications, with support for both low-level authentication state management and pre-built UI components.

## Features

### Currently Available
- ✅ Flexible authentication patterns (hooks & components)
- ✅ Next.js App Router support
- ✅ TypeScript support
- ✅ Server Components and Server Actions support
- ✅ Clean separation between client and server code
- ✅ Beautiful pre-built UI components
- ✅ Email/password authentication
- ✅ Password reset flow
- ✅ Cookie-based session management
- ✅ Comprehensive error handling
- ✅ Environment variable validation

### Coming Soon
- ⏳  Social authentication (Google) - needs the webhooks, but form is integrated
- ⏳ Two-Factor Authentication (2FA)
- ⏳ Multi-Factor Authentication (MFA)
- ⏳ Phone number authentication
- ⏳ Magic link authentication
- ⏳ Email verification flow
- ⏳ Enhanced session management
- ⏳ Rate limiting
- ⏳ Account locking
- ⏳ Password strength requirements
- ⏳ User profile management

## Installation

```bash
npm install @repo/supabase-auth
```

## Usage

### Setup

First, create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Client-side Authentication

There are two ways to implement authentication in your application:

#### 1. Using Authentication Context and Hooks

```tsx
// app/layout.tsx
import { AuthProvider } from '@repo/supabase-auth/components';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

// app/profile/page.tsx (client component)
'use client';

import { useAuth } from '@repo/supabase-auth/components';

export default function Profile() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

#### 2. Using Pre-built UI Components

```tsx
// app/(unauthenticated)/sign-in/[[...sign-in]]/page.tsx
import { SignInForm } from '@repo/supabase-auth/components';

export default function SignInPage() {
  return (
    <SignInForm 
      redirectTo="/"
      revalidatePaths={['/']}
      enableGoogleSignIn={true}
      title="Welcome back"
      description="Enter your details to sign in"
    />
  );
}
```

### Server-side Authentication

```tsx
// app/(authenticated)/layout.tsx
import { requireUser } from '@repo/supabase-auth';
import { getServerClient } from '@repo/supabase-auth/clients/server';
import { redirect } from 'next/navigation';

export default async function AuthenticatedLayout({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const supabase = await getServerClient();
  const { data: user } = await requireUser(supabase);

  if (!user) {
    redirect('/sign-in');
  }

  return <>{children}</>;
}
```

## API Reference

### Clients

- `getBrowserClient()` - Get a Supabase client for browser use
- `getServerClient()` - Get a Supabase client for server components and actions
- `getAdminClient()` - Get a Supabase client with admin privileges (server-only)

### Hooks

- `useAuth()` - Hook to access authentication state and user information
- `useSession()` - Hook to get and subscribe to the current session

### Components

- `AuthProvider` - Provider component to handle auth state
- `SignInForm` - Pre-built sign-in form with email/password and social authentication
- `SignUpForm` - Pre-built sign-up form with email/password and social authentication
- `ForgotPasswordForm` - Pre-built form for password reset requests

### Server Utilities

- `requireUser(client)` - Utility to require authentication in server components
- `updateSession(request)` - Middleware utility to handle session refresh

## Pre-built Components

### SignInForm

A fully-featured sign-in form component with email/password and Google authentication.

```tsx
type SignInFormProps = {
  redirectTo?: string;
  revalidatePaths?: string[];
  onSuccess?: (data: { success: true; session: unknown }) => void;
  onError?: (error: Error) => void;
  enableGoogleSignIn?: boolean;
  title?: string;
  description?: string;
};
```

### Error Handling

The package includes built-in error handling with user-friendly messages for common authentication scenarios:

- Invalid credentials
- Email confirmation required
- Rate limiting
- Network issues
- Account not found
- Invalid email format
- Password requirements

## Design System Integration

The pre-built components are built on top of the `@repo/design-system` components, ensuring a consistent look and feel across your application. Key components used include:

- Alert
- Button
- Card
- Input
- Label

## Security

- CSRF protection built-in
- Secure session handling
- Environment-based configuration
- JWT validation
- Cookie security flags

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT 