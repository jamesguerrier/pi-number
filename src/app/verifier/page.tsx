"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { VerifierTool } from "@/components/verifier-tool";
import { Loto3Generator } from "@/components/loto3-generator"; // Import new component

export default function VerifierPage() {
  const { isLoading, session } = useAuth();

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

  return (
    <div className="min-h-[calc(100vh-10rem)] p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-xl space-y-8">
        <h1 className="text-3xl font-bold mb-6">Verifier Tools</h1>
        
        {/* Existing Verifier Tool */}
        <VerifierTool />
        
        {/* New Loto-3 Generator */}
        <Loto3Generator />
      </div>
    </div>
  );
}