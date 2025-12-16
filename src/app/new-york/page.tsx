"use client";

import { NumberAnalysisForm } from "@/components/number-analysis-form";
import { useAuth } from "@/context/auth-context";
import { Loader2, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useIsAdmin } from "@/hooks/use-is-admin";

export default function NewYorkPage() {
  const { isLoading, session } = useAuth();
  const isAdmin = useIsAdmin();

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
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {isAdmin && (
          <div className="flex justify-end mb-4">
            <Link href="/new-york/manage" passHref>
              <Button variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Manage Data
              </Button>
            </Link>
          </div>
        )}
        <NumberAnalysisForm location="New York" tableName="new_york_data" />
      </div>
    </div>
  );
}