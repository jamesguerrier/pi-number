"use client";

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';

// Dynamically import the client component, disabling SSR
const LoginClient = dynamicImport(
  () => import("./LoginClient"),
  { ssr: false }
);

// Disable static rendering for this page as it relies heavily on client-side hooks and Supabase Auth UI.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { isLoading, session } = useAuth();
  const searchParams = useSearchParams();
  const view = (searchParams.get('view') || 'sign_in') as 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If already authenticated, the AuthProvider handles the redirect, 
  // but return null while the redirect happens.
  if (session) {
    return null; 
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            {view === 'sign_up' ? 'Create Account' : 'Sign In'}
          </CardTitle>
        </CardHeader>
        {/* Render the dynamically imported client component */}
        <LoginClient view={view} />
      </Card>
    </div>
  );
}