"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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
        <CardContent>
          <Auth
            supabaseClient={supabase}
            providers={[]}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light"
            view={view}
            redirectTo="/new-york"
          />
        </CardContent>
      </Card>
    </div>
  );
}