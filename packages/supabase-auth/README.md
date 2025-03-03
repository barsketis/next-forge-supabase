# Supabase Auth

A simplified Supabase authentication package for Next.js applications, with a focus on clean separation of concerns and minimal complexity.

## Features

- Simple, focused API for authentication
- Next.js App Router support
- TypeScript support
- Server Components and Server Actions support
- Clean separation between client and server code

## Installation

```bash
npm install supabase-auth
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

```tsx
// app/layout.tsx
import { AuthProvider } from 'supabase-auth';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

// app/profile/page.tsx (client component)
'use client';

import { useAuth } from 'supabase-auth';

export default function Profile() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;
  
  return <div>Welcome, {user.email}</div>;
}
```

### Server-side Authentication

```tsx
// app/profile/page.tsx (server component)
import { getServerClient, requireUser } from 'supabase-auth';
import { redirect } from 'next/navigation';

export default async function Profile() {
  const supabase = getServerClient();
  const { data: user, error } = await requireUser(supabase);
  
  if (error) {
    redirect('/sign-in');
  }
  
  return <div>Welcome, {user.email}</div>;
}
```

### Authentication Actions

```tsx
// app/sign-in/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'supabase-auth/actions/auth';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await signIn(email, password);
    
    if (error) {
      console.error('Error signing in:', error.message);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        type="password" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

## API Reference

### Clients

- `getBrowserClient()` - Get a Supabase client for browser use
- `getServerClient()` - Get a Supabase client for server components and actions
- `getAdminClient()` - Get a Supabase client with admin privileges (server-only)

### Hooks

- `useAuth()` - Hook to access the auth context
- `useSession()` - Hook to get and subscribe to the current session

### Components

- `AuthProvider` - Provider component to handle auth state
- `SignIn` - Pre-built sign-in form
- `SignUp` - Pre-built sign-up form
- `SignOut` - Sign-out button

### Actions

- `signIn(email, password)` - Server action to sign in
- `signUp(email, password)` - Server action to sign up
- `signOut()` - Server action to sign out

### Utilities

- `requireUser(client)` - Utility to require authentication 