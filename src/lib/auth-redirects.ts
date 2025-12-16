import { usePathname, useRouter } from 'next/navigation';

const PUBLIC_ROUTES = ['/', '/login'];

export function useAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();

  const redirectIfUnauthenticated = (isAuthenticated: boolean, isLoading: boolean) => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!isAuthenticated && !isPublicRoute) {
        router.push('/login');
        return true;
      }
    }
    return false;
  };

  const redirectIfAuthenticated = (isAuthenticated: boolean, isLoading: boolean) => {
    if (!isLoading && isAuthenticated && pathname === '/login') {
      router.push('/new-york');
      return true;
    }
    return false;
  };

  return {
    redirectIfUnauthenticated,
    redirectIfAuthenticated,
  };
}