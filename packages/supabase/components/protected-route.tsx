'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '../app-router/hooks/use-auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  loadingComponent?: React.ReactNode;
}

/**
 * ProtectedRoute component
 *
 * Wraps a component that should only be accessible by authenticated users.
 * If not authenticated, redirects to sign-in page with returnTo parameter.
 *
 * @example
 * <ProtectedRoute>
 *   <Dashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  redirectTo = '/sign-in',
  loadingComponent = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { status, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Only redirect if we've finished loading and user is not authenticated
    if (!isLoading && status === 'unauthenticated') {
      // Create the full return path including search params
      const returnPath =
        pathname +
        (searchParams.toString() ? `?${searchParams.toString()}` : '');
      router.push(`${redirectTo}?returnTo=${encodeURIComponent(returnPath)}`);
    }
  }, [status, isLoading, router, pathname, searchParams, redirectTo]);

  // Show loading component while checking auth status
  if (isLoading || status === 'loading') {
    return <>{loadingComponent}</>;
  }

  // If not authenticated and not loading, we're in the process of redirecting
  // so still show loading component
  if (status === 'unauthenticated') {
    return <>{loadingComponent}</>;
  }

  // If authenticated, render children
  return <>{children}</>;
}
