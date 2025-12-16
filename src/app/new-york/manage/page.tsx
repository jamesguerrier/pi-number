"use client";

import { DataManagementPage } from "@/components/data-management-page";
import { Loader2 } from "lucide-react";
import { useProtectedRoute } from "@/hooks/use-protected-route";

export default function NewYorkManagePage() {
  const { isLoading, isAuthenticated } = useProtectedRoute();

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <DataManagementPage location="New York" tableName="new_york_data" />
    </div>
  );
}