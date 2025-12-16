"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, User as UserIcon } from "lucide-react";
import { ProfileFormValues, ProfileSchema } from "@/lib/schemas";
import { useAuth } from "@/context/auth-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthActions } from "@/hooks/use-auth-actions";

interface ProfileFormProps {
  initialProfile: any;
}

export function ProfileForm({ initialProfile }: ProfileFormProps) {
  const { user, refreshProfile } = useAuth();
  const { updateProfile } = useAuthActions();
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      first_name: initialProfile.first_name || "",
      last_name: initialProfile.last_name || "",
      avatar_url: initialProfile.avatar_url || "",
    },
    mode: "onChange",
  });

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
      throw new Error("Authentication error. Please sign in again.");
    }
    
    try {
      await updateProfile(user.id, {
        first_name: values.first_name,
        last_name: values.last_name || null,
        avatar_url: values.avatar_url || null,
      });
      
      // Refresh the profile in the auth context
      await refreshProfile();
    } catch (error) {
      // Error is already handled by useAuthActions
    }
  }

  const avatarUrl = form.watch('avatar_url');
  const firstName = form.watch('first_name');
  const lastName = form.watch('last_name');
  const initials = (firstName?.[0] || '') + (lastName?.[0] || '');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="flex justify-center">
          <Avatar className="h-24 w-24 border-4 border-primary/10">
            <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
            <AvatarFallback className="text-2xl font-semibold">
              {initials || <UserIcon className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Doe" 
                    {...field} 
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://example.com/avatar.jpg" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2 text-sm text-muted-foreground">
            <p>Email: <span className="font-medium text-foreground">{user?.email}</span></p>
            <p>Member Since: <span className="font-medium text-foreground">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span></p>
        </div>

        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting || !form.formState.isDirty}>
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </Form>
  );
}