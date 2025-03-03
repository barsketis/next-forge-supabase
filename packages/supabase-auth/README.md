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

## Installation

```bash
npm install @repo/supabase-auth
```

## Setup

First, create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

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
    // This updates the auth session cookie
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