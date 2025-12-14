"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/auth-context";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

export function UserAvatar() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createUserProfile();
        } else {
          // For other errors, use metadata from auth
          const defaultProfile: UserProfile = {
            id: user.id,
            first_name: user.user_metadata?.first_name || user.user_metadata?.full_name || 'User',
            last_name: user.user_metadata?.last_name || '',
            avatar_url: null,
            email: user.email || null
          };
          setProfile(defaultProfile);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      // Use auth metadata as fallback
      const fallbackProfile: UserProfile = {
        id: user.id,
        first_name: user.user_metadata?.first_name || user.user_metadata?.full_name || 'User',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: null,
        email: user.email || null
      };
      setProfile(fallbackProfile);
    } finally {
      setLoading(false);
    }
  };

  const createUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          first_name: user.user_metadata?.first_name || user.user_metadata?.full_name || 'User',
          last_name: user.user_metadata?.last_name || '',
          avatar_url: null
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
        throw error;
      }

      setProfile(data);
      toast.success("Profile created successfully");
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      // Use auth metadata as fallback
      const fallbackProfile: UserProfile = {
        id: user.id,
        first_name: user.user_metadata?.first_name || user.user_metadata?.full_name || 'User',
        last_name: user.user_metadata?.last_name || '',
        avatar_url: null,
        email: user.email || null
      };
      setProfile(fallbackProfile);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out: " + error.message);
    } else {
      toast.success("Successfully signed out.");
    }
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const getInitials = () => {
    if (!profile) return "U";
    const first = profile.first_name?.[0] || '';
    const last = profile.last_name?.[0] || '';
    return (first + last).toUpperCase() || profile.email?.[0]?.toUpperCase() || "U";
  };

  if (!user || loading) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profile?.avatar_url || undefined} alt={profile?.first_name || "User"} />
            <AvatarFallback>
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {profile?.first_name} {profile?.last_name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleProfileClick}>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}