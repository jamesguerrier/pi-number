"use client";

import React from 'react';
import { AuthProvider as BaseAuthProvider } from './auth-context';
import { useAuthRedirect } from '@/lib/auth-redirects';
import { useAuthStatus } from '@/hooks/use-auth-status';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <BaseAuthProvider>
      <AuthRedirectHandler>
        {children}
      </AuthRedirectHandler>
    </BaseAuthProvider>
  );
}

function AuthRedirectHandler({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const { redirectIfUnauthenticated, redirectIfAuthenticated } = useAuthRedirect();

  // Handle redirects
  React.useEffect(() => {
    redirectIfUnauthenticated(isAuthenticated, isLoading);
    redirectIfAuthenticated(isAuthenticated, isLoading);
  }, [isAuthenticated, isLoading, redirectIfUnauthenticated, redirectIfAuthenticated]);

  return <>{children}</>;
}