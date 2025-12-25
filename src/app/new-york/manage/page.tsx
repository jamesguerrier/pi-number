"use client";

import { DataManagementPage } from "@/components/data-management-page";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation"; // Import redirect

export default function NewYorkManagePage() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <DataManagementPage location="New York" tableName="new_york_data" />
    </div>
  );
}