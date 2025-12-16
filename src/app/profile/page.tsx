"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuth } from "@/context/auth-context";
import { Loader2, User } from "lucide-react";
import { ProfileForm } from "@/components/profile-form";

export default function ProfilePage() {
  const { isLoading, session, profile } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    // Redirection handled by AuthProvider
    return null;
  }
  
  if (!profile) {
    // This should ideally not happen if the trigger works, but handle the case where profile data is missing.
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
            <CardDescription>Manage your account details.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <User className="h-10 w-10 text-muted-foreground" />
              <p className="text-lg text-muted-foreground">Loading profile data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
          <CardDescription>Update your personal information and avatar.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm initialProfile={profile} />
        </CardContent>
      </Card>
    </div>
  );
}