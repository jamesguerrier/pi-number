"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';

interface ClientOnlyAuthProps {
  view: 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';
}

export function ClientOnlyAuth({ view }: ClientOnlyAuthProps) {
  return (
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
  );
}