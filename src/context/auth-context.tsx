"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

type AuthContextType = {
  session: Session | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch initial session state synchronously on mount
    const loadSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      if (isMounted) {
        setSession(initialSession);
        setLoading(false);
      }
    };
    
    loadSession();

    // 2. Set up listener for subsequent changes (sign in, sign out, refresh)
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (isMounted) {
          setSession(session);
          // Ensure loading is false after the first event, even if loadSession was slow
          setLoading(false); 
        }
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}