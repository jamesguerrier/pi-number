"use client";

import { Card, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { Suspense, useEffect } from 'react';
import { AuthViewContent } from './AuthViewContent';
import { useRouter } from 'next/navigation'; // Import useRouter

// Disable static rendering for this page as it relies heavily on client-side hooks and Supabase Auth UI.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  const { isLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      router.replace('/new-york');
    }
  }, [isLoading, session, router]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If session exists, useEffect handles redirect, return null while waiting.
  if (session) {
    return null; 
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          {/* Wrap the content that uses useSearchParams in Suspense */}
          <Suspense fallback={<Loader2 className="h-6 w-6 animate-spin mx-auto my-4" />}>
            <AuthViewContent />
          </Suspense>
        </CardHeader>
      </Card>
    </div>
  );
}