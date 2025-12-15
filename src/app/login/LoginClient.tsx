"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { createClient } from '@supabase/supabase-js';
import { CardContent } from '@/components/ui/card';
import { useMemo } from 'react';

// NOTE: We use hardcoded values here as a fallback/reference, but they should ideally 
// be managed via environment variables in a real deployment.
const SUPABASE_URL = "https://tgqljjfjwelpeansngju.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRncWxqamZqd2VscGVhbnNuZ2p1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODU4OTUsImV4cCI6MjA4MTI2MTg5NX0.MbPYVHGgaULaDWup32e1WLFl9OjNAu45O-QV999ab1nU";

interface LoginClientProps {
    view: 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';
}

export default function LoginClient({ view }: LoginClientProps) {
  
  // Initialize Supabase client lazily using useMemo to ensure it only runs 
  // when the component is mounted on the client (since this file is dynamically imported with ssr: false).
  const supabase = useMemo(() => {
    // Use environment variables if available, otherwise use the hardcoded fallback
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_PUBLISHABLE_KEY;
    
    return createClient(url, key);
  }, []);

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