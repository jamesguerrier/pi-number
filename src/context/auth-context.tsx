"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('AuthProvider mounted, pathname:', pathname);

    // Initial session check
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        } else {
          console.log('Initial session:', session?.user?.email);
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'User:', session?.user?.email);
      console.log('Session expires at:', session?.expires_at);
      
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (event === 'SIGNED_IN') {
        console.log('User signed in, redirecting to /new-york');
        toast.success("Welcome back!");
        // Only redirect if we're on the login page
        if (pathname === '/login') {
          setTimeout(() => {
            router.push('/new-york');
          }, 100);
        }
      }
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        toast.info("You have been signed out.");
        // Only redirect if we're not on a public route
        if (!PUBLIC_ROUTES.includes(pathname)) {
          router.push('/login');
        }
      }

      if (event === 'TOKEN_REFRESHED') {
        console.log('Token refreshed');
      }

      if (event === 'USER_UPDATED') {
        console.log('User updated');
      }
    });

    return () => {
      console.log('AuthProvider unmounting');
      subscription.unsubscribe();
    };
  }, [router, pathname]);

  // Handle routing protection
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!session && !isPublicRoute) {
        // Unauthenticated user trying to access a protected route
        console.log('Redirecting to login from:', pathname);
        router.push('/login');
      }
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