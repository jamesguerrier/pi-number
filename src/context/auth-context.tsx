"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { isRateLimitError, handleAuthError } from '@/lib/auth-utils';
import { Profile, fetchUserProfile } from '@/lib/profile-utils';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  rateLimitError: string | null;
  clearRateLimitError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PUBLIC_ROUTES = ['/', '/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rateLimitError, setRateLimitError] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const clearRateLimitError = useCallback(() => {
    setRateLimitError(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const newProfile = await fetchUserProfile(user.id, user.email);
      setProfile(newProfile);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      if (isRateLimitError(error)) {
        const message = handleAuthError(error);
        setRateLimitError(message);
      }
    }
  }, [user]);

  const handleSessionUpdate = useCallback((newSession: Session | null) => {
    setSession(newSession);
    const currentUser = newSession?.user ?? null;
    setUser(currentUser);

    if (currentUser) {
      console.log("User authenticated:", currentUser.id, currentUser.email);
      // Fetch profile asynchronously
      fetchUserProfile(currentUser.id, currentUser.email)
        .then(newProfile => {
          setProfile(newProfile);
        })
        .catch(error => {
          console.error("Failed to fetch profile:", error);
          if (isRateLimitError(error)) {
            const message = handleAuthError(error);
            setRateLimitError(message);
          }
        });
    } else {
      console.log("No user session");
      setProfile(null);
    }
  }, []);

  const handleAuthStateChange = useCallback((event: string, newSession: Session | null) => {
    console.log(`Auth Event: ${event}`, newSession?.user?.id);
    
    handleSessionUpdate(newSession);
    
    if (event === 'SIGNED_IN' && pathname === '/login') {
      router.push('/new-york');
      toast.success("Welcome back!");
    }
    
    if (event === 'SIGNED_OUT') {
      if (!PUBLIC_ROUTES.includes(pathname)) {
        router.push('/login');
        toast.info("You have been signed out.");
      }
    }
  }, [pathname, router, handleSessionUpdate]);

  useEffect(() => {
    let isMounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!isMounted) return;
      handleAuthStateChange(event, newSession);
    });

    // Initial session check with delay
    setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
        if (!isMounted) return;
        console.log("Initial session check:", initialSession?.user?.id);
        handleSessionUpdate(initialSession);
        setIsLoading(false);
      }).catch((error) => {
        if (!isMounted) return;
        console.error("Error getting initial session:", error);
        if (isRateLimitError(error)) {
          const message = handleAuthError(error);
          setRateLimitError(message);
        }
        setIsLoading(false);
      });
    }, 200);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, handleSessionUpdate]);

  // Handle routing protection
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!session && !isPublicRoute) {
        router.push('/login');
      }
    }
  }, [isLoading, session, pathname, router]);

  const contextValue = React.useMemo(() => ({
    session,
    user,
    profile,
    isLoading,
    rateLimitError,
    clearRateLimitError,
    refreshProfile,
  }), [session, user, profile, isLoading, rateLimitError, clearRateLimitError, refreshProfile]);

  return (
    <AuthContext.Provider value={contextValue}>
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