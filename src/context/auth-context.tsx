"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means "no rows found"
      console.error("Error fetching profile:", error);
      toast.error("Failed to load user profile.");
      setProfile(null);
    } else if (data) {
      setProfile(data as Profile);
    } else {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);

      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

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
        if (session?.user) {
            fetchProfile(session.user.id);
        }
        setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [router, pathname, fetchProfile]);

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
    <AuthContext.Provider value={{ session, user, profile, isLoading }}>
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