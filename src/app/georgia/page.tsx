"use client";

import { GeorgiaNumberAnalysisForm } from "@/components/georgia-analysis-form";
import { useAuth } from "@/context/auth-context";
import { Loader2, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { isUserAdmin } from "@/lib/utils";

export default function GeorgiaPage() {
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
  
  const isAdmin = isUserAdmin(session.user?.email);

  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {isAdmin && (
          <div className="flex justify-end mb-4">
            <Link href="/georgia/manage" passHref>
              <Button variant="outline" className="gap-2">
                <Database className="h-4 w-4" />
                Manage Data
              </Button>
            </Link>
          </div>
        )}
        <GeorgiaNumberAnalysisForm location="Georgia" tableName="georgia_data" />
      </div>
    </div>
  );
}