import { supabase } from '@/integrations/supabase/client';
import { isRateLimitError } from './auth-utils';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchUserProfile(userId: string, userEmail?: string | null): Promise<Profile> {
  if (!userId) {
    throw new Error("No user ID provided to fetchProfile");
  }
  
  console.log(`Fetching profile for user: ${userId}`);
  
  try {
    // Try to fetch existing profile
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error("Supabase error fetching profile:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      if (isRateLimitError(error)) {
        throw error;
      }
      
      // If profile doesn't exist, create it
      return await createUserProfile(userId, userEmail);
    }

    if (data) {
      console.log("Profile fetched successfully:", data);
      return data as Profile;
    }

    // No profile found, create one
    return await createUserProfile(userId, userEmail);
  } catch (error) {
    console.error("Unexpected error in fetchUserProfile:", error);
    
    // Return a minimal profile object so the app can continue
    return {
      id: userId,
      first_name: userEmail?.split('@')[0] || 'User',
      last_name: null,
      avatar_url: null,
      email: userEmail || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}

export async function createUserProfile(userId: string, userEmail?: string | null): Promise<Profile> {
  console.log("Creating profile for user:", userId);
  
  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: userEmail || null,
      first_name: userEmail?.split('@')[0] || 'User',
      last_name: null,
      avatar_url: null
    })
    .select()
    .single();
    
  if (createError) {
    console.error("Failed to create profile:", createError);
    
    if (isRateLimitError(createError)) {
      throw createError;
    }
    
    // Return fallback profile if creation fails
    return {
      id: userId,
      first_name: userEmail?.split('@')[0] || 'User',
      last_name: null,
      avatar_url: null,
      email: userEmail || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  console.log("Profile created successfully:", newProfile);
  return newProfile as Profile;
}

export async function updateUserProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select()
    .single();
    
  if (error) {
    console.error("Failed to update profile:", error);
    throw error;
  }
  
  return updatedProfile as Profile;
}