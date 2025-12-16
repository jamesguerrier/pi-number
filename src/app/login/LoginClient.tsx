"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface LoginClientProps {
    view: 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';
}

export default function LoginClient({ view }: LoginClientProps) {
  
  // Use the globally defined supabase client
  return (
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
  );
}