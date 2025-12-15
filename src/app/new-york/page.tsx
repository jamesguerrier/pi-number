"use client";

import { NumberAnalysisForm } from "@/components/number-analysis-form";
import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";

export default function NewYorkPage() {
  const { isLoading, session } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    // Redirection handled by AuthProvider, but return null/loading state while redirecting
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <NumberAnalysisForm location="New York" />
    </div>
  );
}