"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { CardContent } from '@/components/ui/card';

// NOTE: We initialize the Supabase client here locally. This component is dynamically 
// imported with ssr: false, guaranteeing that this client initialization 
// (which relies on browser context or complex dependencies) only runs in the browser.
const SUPABASE_URL = "https://tgqljjfjwelpeansngju.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncWxqamZqd2VscGVhbnNuZ2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODU4OTUsImV4cCI6MjA4MTI2MTg5NX0.MbPYVHGgaULaDWup32e1WLFl9OjNAu45O-QV99ab1nU";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

interface LoginClientProps {
    view: 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';
}

export default function LoginClient({ view }: LoginClientProps) {
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