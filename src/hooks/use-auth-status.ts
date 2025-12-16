import { useAuth } from '@/context/auth-context';

export function useAuthStatus() {
  const { session, user, profile, isLoading } = useAuth();

  const isAuthenticated = !!session && !!user;
  const hasProfile = !!profile;
  const isProfileComplete = !!profile?.first_name && !!profile?.email;

  return {
    isAuthenticated,
    hasProfile,
    isProfileComplete,
    isLoading,
    session,
    user,
    profile,
  };
}