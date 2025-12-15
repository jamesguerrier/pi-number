"use client";

import { useSearchParams } from 'next/navigation';
import dynamicImport from 'next/dynamic';
import { CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Dynamically import the client component, disabling SSR
const LoginClient = dynamicImport(
  () => import("./LoginClient"),
  { 
    ssr: false,
    loading: () => <Loader2 className="h-6 w-6 animate-spin mx-auto my-4" />
  }
);

export function AuthViewContent() {
  const searchParams = useSearchParams();
  const view = (searchParams.get('view') || 'sign_in') as 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';

  return (
    <>
      <CardTitle className="text-2xl font-bold">
        {view === 'sign_up' ? 'Create Account' : 'Sign In'}
      </CardTitle>
      {/* LoginClient renders the CardContent */}
      <LoginClient view={view} />
    </>
  );
}