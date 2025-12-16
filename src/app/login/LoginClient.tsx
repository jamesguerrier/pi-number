"use client";

import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { RateLimitAlert } from '@/components/ui/rate-limit-alert';
import { useAuthRetry } from '@/hooks/use-auth-retry';
import { isRateLimitError, handleAuthError } from '@/lib/auth-utils';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface LoginClientProps {
    view: 'sign_in' | 'sign_up' | 'forgotten_password' | 'update_password';
}

export default function LoginClient({ view }: LoginClientProps) {
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const { retryCount, isRetrying, canRetry, getTimeUntilRetry, recordError, resetRetry } = useAuthRetry();

  // Listen for auth state changes to detect rate limit errors
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Reset rate limit error on successful auth
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setRateLimitError(null);
        resetRetry();
      }
    });

    return () => subscription.unsubscribe();
  }, [resetRetry]);

  // Handle auth errors from the Auth component
  const handleAuthErrorWrapper = (error: any) => {
    if (isRateLimitError(error)) {
      const message = handleAuthError(error);
      setRateLimitError(message);
      recordError();
      return;
    }
    
    handleAuthError(error);
  };

  const handleRetry = () => {
    if (canRetry()) {
      setRateLimitError(null);
      // Force a refresh of the auth UI
      window.location.reload();
    }
  };

  const timeUntilRetry = getTimeUntilRetry();
  const canRetryNow = canRetry();

  return (
    <CardContent className="space-y-4">
      {rateLimitError && (
        <RateLimitAlert 
          message={rateLimitError}
          onRetry={canRetryNow ? handleRetry : undefined}
          retryDisabled={!canRetryNow || isRetrying}
        />
      )}

      {!canRetryNow && (
        <div className="text-center text-sm text-muted-foreground p-3 bg-muted rounded-lg">
          <RefreshCw className="h-4 w-4 animate-spin inline-block mr-2" />
          {timeUntilRetry > 0 
            ? `Retry available in ${timeUntilRetry} second${timeUntilRetry !== 1 ? 's' : ''}`
            : 'Preparing retry...'
          }
        </div>
      )}

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