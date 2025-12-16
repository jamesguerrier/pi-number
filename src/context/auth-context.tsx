"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_IN' && pathname === '/login') {
        router.push('/new-york'); // Redirect signed-in users from login page
        toast.success("Welcome back!");
      }
      
      if (event === 'SIGNED_OUT') {
        // If the user signs out, redirect them to the login page
        if (!PUBLIC_ROUTES.includes(pathname)) {
            router.push('/login');
            toast.info("You have been signed out.");
        }
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, pathname]);

  // Handle routing protection
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!session && !isPublicRoute) {
        // Unauthenticated user trying to access a protected route
        router.push('/login');
      }
      
      // Note: Redirection from /login to /new-york on SIGNED_IN is handled in onAuthStateChange
    }
  }, [isLoading, session, pathname, router]);


  return (
    <AuthContext.Provider value={{ session, user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}