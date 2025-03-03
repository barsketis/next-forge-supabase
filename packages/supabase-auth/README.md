# Next Forge Supabase Auth

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
- ⏳ Social authentication (Google) - needs the webhooks, but form is integrated
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

## How It Works

This library provides a seamless integration between Next.js and Supabase Auth, with special focus on Server-Side Rendering (SSR) functionality. Understanding how the authentication flow works is key to effectively implementing it in your application.

### Authentication Flow Architecture

Supabase Auth uses JWT-based authentication with two key tokens:
1. **Access Token**: A short-lived JWT containing user claims
2. **Refresh Token**: A longer-lived token used to obtain new access tokens

In an SSR context, these tokens are managed through cookies to ensure they're accessible by both server and client code. Here's how the authentication flow works:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│     Browser     │◄────┤  Next.js Server │◄────┤  Supabase Auth  │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲ │                     ▲ │                     ▲
        │ │                     │ │                     │
        │ ▼                     │ ▼                     │
┌─────────────────┐     ┌─────────────────┐             │
│  Client-side    │     │  Server-side    │             │
│  Components     │     │  Components     │             │
└─────────────────┘     └─────────────────┘             │
        │                       │                       │
        └───────────────────────┴───────────────────────┘
```

### SSR Session Management

When a user visits your application:

1. **Initial Request**: 
   - Cookies containing auth tokens are sent to the server
   - The Next.js **middleware** (critical component) intercepts the request
   - Middleware uses `updateSession()` to check token validity

2. **Token Refreshing**:
   - If the access token is expired, the middleware automatically uses the refresh token to obtain a new one
   - New tokens are set as cookies in the response headers
   - Without the middleware, token refreshing won't work properly in SSR contexts

3. **Server Component Rendering**:
   - Server components can read auth state using `getServerClient()`
   - Server components can't set cookies, which is why middleware is essential

4. **Client-side Hydration**:
   - After server rendering, client components take over
   - Client components use `getBrowserClient()` to manage auth state
   - The client handles proactive token refreshing during user interactions

This separation of concerns ensures your authentication works seamlessly across server and client environments.



## Setup

First, create a `.env.local` file with your Supabase credentials:

Second, follow the instructions for the next-forge supabase db integration

Add your `.env` in packages/database to direct query the supa instance, find these by clicking the "connect" button above the table, make sure to add ?pgbouncer=true&connection_limit=1" to the 6543 route
```
DATABASE_URL="postgresql://postgres.qpifrnvmlcdrqbomgbkq:[YOUR-PASSWORD]@[YOUR-DB-HOST]:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:6543/postgres"
```

Add your `.env` in packages/supabase-auth
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Installation

```bash
pnpm install --filter packages/supabase-auth
```

Create the DB instance from the `schema.prisma` file found in your package/database
```bash
pnpm migrate
```
This command will:
1. Format your Prisma schema
2. Generate Prisma client code
3. Push the schema changes to your database

```sh
# Generate Supabase TypeScript types
pnpm supabase:typegen
```
This is optional but can be helpful for maintaining type safety when interacting with your Supabase database. Prisma is not needed with supabase, so you may remove the database folder, and use the db types / supabase client for db queries.


## Usage Examples

### 1. Base Configuration

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
```

### 2. Client Browser Authentication

#### Access user data in client components

```tsx
// app/components/profile-status.tsx
'use client';

import { useAuth } from '@repo/supabase-auth/components';

export function ProfileStatus() {
  const { user, isLoading, error } = useAuth();
  
  if (isLoading) return <div>Loading user information...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return (
    <div>
      <p>Welcome, {user.email}</p>
      <p>User ID: {user.id}</p>
      <p>Last sign in: {new Date(user.last_sign_in_at || '').toLocaleString()}</p>
    </div>
  );
}
```

#### Subscribe to session changes

```tsx
// app/components/session-tracker.tsx
'use client';

import { useSession } from '@repo/supabase-auth/hooks/use-session';
import { useEffect } from 'react';

export function SessionTracker() {
  const { session, loading } = useSession();
  
  useEffect(() => {
    if (session) {
      // Identify user in analytics
      analytics.identify(session.user.id, {
        email: session.user.email,
        created_at: session.user.created_at,
      });
      
      // You can also refresh data when session changes
      fetchUserData(session.user.id);
    }
  }, [session]);
  
  return null; // This component doesn't render anything
}
```

#### Custom sign out button

```tsx
// app/components/logout-button.tsx
'use client';

import { getBrowserClient } from '@repo/supabase-auth/clients/browser';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      const supabase = getBrowserClient();
      await supabase.auth.signOut();
      router.push('/sign-in');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button 
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? 'Signing out...' : 'Sign Out'}
    </button>
  );
}
```

### 3. Server Authentication

#### Protected layout (Server Component)

```tsx
// app/(authenticated)/layout.tsx
import { requireUser } from '@repo/supabase-auth';
import { getServerClient } from '@repo/supabase-auth/clients/server';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({ children }) {
  const supabase = await getServerClient();
  const { data: user, error, redirectTo } = await requireUser(supabase);

  // Redirect to sign in page if not authenticated
  if (!user) {
    redirect(redirectTo || '/sign-in');
  }

  return <>{children}</>;
}
```

#### Data fetching with authentication (Server Component)

```tsx
// app/(authenticated)/dashboard/page.tsx
import { getServerClient } from '@repo/supabase-auth/clients/server';

export default async function DashboardPage() {
  const supabase = await getServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return <div>You must be signed in to view this page</div>;
  }
  
  // Fetch user-specific data
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });
    
  return (
    <div>
      <h1>Your Projects</h1>
      {projects?.length ? (
        <ul>
          {projects.map(project => (
            <li key={project.id}>{project.name}</li>
          ))}
        </ul>
      ) : (
        <p>No projects found. Create your first project.</p>
      )}
    </div>
  );
}
```

### 4. Server Actions

#### User data management (Server Action)

```tsx
// app/actions/user-profile.ts
'use server';

import { getServerClient } from '@repo/supabase-auth/clients/server';

export async function updateUserProfile(formData: FormData) {
  const supabase = await getServerClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: 'Not authenticated' };
  }
  
  const name = formData.get('name') as string;
  const bio = formData.get('bio') as string;
  
  // Update user metadata
  const { error } = await supabase.auth.updateUser({
    data: { name, bio }
  });
  
  if (error) {
    return { error: error.message };
  }
  
  return { success: true };
}
```

#### Admin operations (Server Action)

```tsx
// app/admin/actions/user-management.ts
'use server';

import { getAdminClient } from '@repo/supabase-auth/clients/server';

export async function getUser(userId: string) {
  try {
    // Admin client has additional privileges
    const supabase = getAdminClient();
    
    const { data: { user }, error } = await supabase.auth.admin.getUserById(userId);
    
    if (error) {
      return { error: error.message };
    }
    
    return { user };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteUser(userId: string) {
  try {
    const supabase = getAdminClient();
    const { error } = await supabase.auth.admin.deleteUser(userId);
    
    if (error) {
      return { error: error.message };
    }
    
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

### 5. Middleware

The middleware implementation is **critical** for proper SSR functionality. Without it, token refreshing won't work correctly in server components.

```tsx
// middleware.ts
import { updateSession } from '@repo/supabase-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that don't require authentication
const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/reset-password', '/auth/callback'];
// Static assets and API routes that should bypass auth checks
const BYPASS_PATHS = ['/_next', '/static', '/api/public', '/favicon.ico'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Early return for bypassed paths
  if (BYPASS_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  try {
    // This updates the auth session cookie - THE MOST CRITICAL PART OF SSR AUTH
    // It checks if the access token is expired and refreshes it if needed
    await updateSession(request);
    
    // For protected routes, check if user is authenticated
    if (!PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
      // Additional authentication checks could go here
    }
    
    return NextResponse.next();
  } catch (error) {
    if (error.message === 'refresh_token_not_found') {
      // If not on a public path, redirect to sign in
      if (!PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
      }
    }
    
    console.error('Auth middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 6. Authentication UI Components

#### Sign In Form

```tsx
// app/(auth)/sign-in/page.tsx
import { SignIn } from '@repo/supabase-auth/components';

export default function SignInPage() {
  return (
    <div className="container mx-auto py-10">
      <SignIn 
        redirectTo="/dashboard"
        revalidatePaths={['/dashboard']}
        enableGoogleSignIn={true}
        title="Welcome back"
        description="Sign in to your account to continue"
        onSuccess={({ session }) => {
          // You can perform additional actions after successful sign in
          console.log('Sign in successful', session);
        }}
        onError={(error) => {
          // Custom error handling
          console.error('Sign in error:', error);
        }}
      />
    </div>
  );
}
```

#### Sign Up Form

```tsx
// app/(auth)/sign-up/page.tsx
import { SignUp } from '@repo/supabase-auth/components';

export default function SignUpPage() {
  return (
    <div className="container mx-auto py-10">
      <SignUp 
        redirectTo="/onboarding"
        revalidatePaths={['/api/user']}
        enableGoogleSignIn={true}
        title="Create an account"
        description="Enter your details to get started"
      />
    </div>
  );
}
```

#### Password Reset Form

```tsx
// app/(auth)/reset-password/page.tsx
import { ForgotPassword } from '@repo/supabase-auth/components';

export default function ForgotPasswordPage() {
  return (
    <div className="container mx-auto py-10">
      <ForgotPassword 
        redirectTo="/sign-in"
        title="Reset your password"
        description="Enter your email and we'll send you a reset link"
      />
    </div>
  );
}
```

## Technical Details

### Token Management

This library handles authentication tokens in the following ways:

1. **Token Storage**: 
   - Access tokens and refresh tokens are stored in cookies
   - Cookies are chunked if they exceed size limits (approximately 3180 bytes)
   - Tokens are encoded to comply with cookie format requirements

2. **Token Refresh**:
   - Access tokens are refreshed automatically in the middleware
   - Client-side code proactively refreshes tokens before they expire
   - If a refresh token is invalid, the user is signed out

3. **Cookie Management**:
   - The library handles all cookie creation, updating, and removal
   - Security settings like HttpOnly, SameSite, and Secure are properly configured
   - Both chunked and non-chunked cookies are correctly managed

### Client/Server Separation

The library maintains a clear separation between client and server code:

- **Server-side**: Uses `getServerClient()` which reads cookies from request headers
- **Client-side**: Uses `getBrowserClient()` which reads/writes to browser cookies
- **Middleware**: Uses cookie APIs to handle token refreshing

## Troubleshooting

### Common Issues

1. **Authentication not working in server components**:
   - Make sure you've implemented the middleware correctly
   - Verify the middleware is actually running (add console logs)
   - Check that your routes are properly matched in the middleware config

2. **Session not persisting between pages**:
   - Ensure cookies are being set correctly in responses
   - Check for cookie size issues causing truncation
   - Verify domain/path configurations match your application structure

3. **"Refresh token not found" errors**:
   - This usually means the user is not signed in or the session has expired
   - Check that cookies are not being blocked by browser settings
   - Ensure your cookies are configured for the correct domain/path

4. **Sign-in works but data fetching fails**:
   - Ensure you're using the correct Supabase client in each context
   - Verify RLS policies on your Supabase tables
   - Check that your JWT claims match your policy requirements

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
- `SignIn` - Pre-built sign-in form with email/password and social authentication
- `SignUp` - Pre-built sign-up form with email/password and social authentication
- `ForgotPassword` - Pre-built form for password reset requests
- `SignOut` - Pre-built sign-out button component

### Server Utilities

- `requireUser(client)` - Utility to require authentication in server components
- `updateSession(request)` - Middleware utility to handle session refresh

## Component Props

### SignIn

```tsx
type SignInProps = {
  redirectTo?: string;                  // Where to redirect after successful sign in
  revalidatePaths?: string[];           // Paths to revalidate after sign in
  onSuccess?: (data: { success: true; session: unknown }) => void;  // Success callback
  onError?: (error: Error) => void;     // Error callback
  enableGoogleSignIn?: boolean;         // Enable Google sign in button
  title?: string;                       // Form title
  description?: string;                 // Form description
};
```

### SignUp

```tsx
type SignUpProps = {
  redirectTo?: string;                  // Where to redirect after successful sign up
  revalidatePaths?: string[];           // Paths to revalidate after sign up
  onSuccess?: (data: { success: true; session: unknown }) => void;  // Success callback
  onError?: (error: Error) => void;     // Error callback
  enableGoogleSignIn?: boolean;         // Enable Google sign up button
  title?: string;                       // Form title
  description?: string;                 // Form description
};
```

### ForgotPassword

```tsx
type ForgotPasswordProps = {
  redirectTo?: string;                  // Where to redirect after sending reset email
  onSuccess?: (data: { success: true }) => void;  // Success callback
  onError?: (error: Error) => void;     // Error callback
  title?: string;                       // Form title
  description?: string;                 // Form description
};
```

## Error Handling

The package includes built-in error handling with user-friendly messages for common authentication scenarios:

- Invalid credentials
- Email confirmation required
- Rate limiting
- Network issues
- Account not found
- Invalid email format
- Password requirements

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