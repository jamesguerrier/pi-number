import { useEffect } from 'react';
import { useAuthStatus } from './use-auth-status';
import { useAuthRedirect } from '@/lib/auth-redirects';

export function useProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuthStatus();
  const { redirectIfUnauthenticated } = useAuthRedirect();

  useEffect(() => {
    redirectIfUnauthenticated(isAuthenticated, isLoading);
  }, [isAuthenticated, isLoading, redirectIfUnauthenticated]);

  return {
    isAuthenticated,
    isLoading,
  };
}