import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isRateLimitError, handleAuthError } from '@/lib/auth-utils';
import { useAuthRetry } from './use-auth-retry';

export function useAuthActions() {
  const { startRetry, recordError, resetRetry } = useAuthRetry();

  const signOut = useCallback(async () => {
    try {
      const result = await startRetry(async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return true;
      });
      
      toast.success("Successfully signed out.");
      return result;
    } catch (error) {
      handleAuthError(error, "Failed to sign out");
      throw error;
    }
  }, [startRetry]);

  const updateProfile = useCallback(async (userId: string, updates: any) => {
    try {
      const result = await startRetry(async () => {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId)
          .select()
          .single();
          
        if (error) throw error;
        return data;
      });
      
      toast.success("Profile updated successfully!");
      return result;
    } catch (error) {
      handleAuthError(error, "Failed to update profile");
      throw error;
    }
  }, [startRetry]);

  const refreshSession = useCallback(async () => {
    try {
      const result = await startRetry(async () => {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
      });
      
      return result;
    } catch (error) {
      if (isRateLimitError(error)) {
        recordError();
      }
      handleAuthError(error, "Failed to refresh session");
      throw error;
    }
  }, [startRetry, recordError]);

  return {
    signOut,
    updateProfile,
    refreshSession,
    resetRetry,
  };
}