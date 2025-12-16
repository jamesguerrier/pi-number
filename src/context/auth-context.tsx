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

  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    // Ensure we have a user ID before attempting to fetch the profile
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 means "no rows found" (e.g., profile trigger failed or user is new)
        if (error.code === 'PGRST116') { 
          console.log("Profile not found, attempting to create one...");
          
          // Try to create a basic profile for the user
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: userId,
                email: userEmail || null,
                first_name: userEmail?.split('@')[0] || 'User',
                last_name: null,
                avatar_url: null
              }
            ])
            .select()
            .single();

          if (createError) {
            console.error("Error creating profile:", createError);
            // Don't show error toast for RLS failures - just log and continue
            if (!createError.message.includes('row-level security')) {
              toast.error(`Failed to create user profile: ${createError.message}`);
            }
            // Set a minimal profile object so the app can continue
            setProfile({
              id: userId,
              first_name: userEmail?.split('@')[0] || 'User',
              last_name: null,
              avatar_url: null,
              email: userEmail || null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          } else if (newProfile) {
            setProfile(newProfile as Profile);
            toast.success("Profile created successfully!");
          }
        } else {
          console.error("Error fetching profile:", error);
          // Don't block the app on profile errors
          setProfile(null);
        }
      } else if (data) {
        setProfile(data as Profile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("Unexpected error in fetchProfile:", err);
      // Don't block the app on unexpected errors
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const handleSession = (session: Session | null) => {
      if (!isMounted) return;
      
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        // Only fetch profile if we have a user
        fetchProfile(currentUser.id, currentUser.email);
      } else {
        setProfile(null);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Log all events for debugging
      if (event !== 'INITIAL_SESSION') {
        console.log(`Auth Event: ${event}`);
      }
      
      handleSession(session);
      
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
    // Use a slight delay to ensure the client has fully initialized and processed any stored tokens
    setTimeout(() => {
        supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
            handleSession(initialSession);
            setIsLoading(false);
        });
    }, 200); // Increased delay to 200ms

    return () => {
        isMounted = false;
        subscription.unsubscribe();
    };
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