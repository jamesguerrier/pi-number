"use client";

import { DataManagementPage } from "@/components/data-management-page";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function NewJerseyManagePage() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-muted-foreground mb-6">Please sign in to access this page.</p>
          <a href="/login" className="text-primary hover:underline">
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <DataManagementPage location="New Jersey" tableName="new_jersey_data" />
    </div>
  );
}