"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { VerifierTool } from "@/components/verifier-tool";
import { Loto3Generator } from "@/components/loto3-generator";
import { useState } from "react";
import { redirect } from "next/navigation"; // Import redirect

export default function VerifierPage() {
  const { isLoading, session } = useAuth();
  const [loto3Input, setLoto3Input] = useState(''); // State to hold the numbers passed from VerifierTool to Loto3
  const [verifierInputA, setVerifierInputA] = useState(''); // New state for Verifier's Set A input

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
    <div className="min-h-[calc(100vh-10rem)] p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-xl space-y-8">
        <h1 className="text-3xl font-bold mb-6">Verifier Tools</h1>
        
        {/* Verifier Tool now receives and controls its input A state */}
        <VerifierTool 
          onMatchFound={setLoto3Input} 
          inputA={verifierInputA}
          setInputA={setVerifierInputA}
        />
        
        {/* Loto-3 Generator receives the matched numbers and the transfer function */}
        <Loto3Generator 
          inputOverride={loto3Input} 
          onTransferToVerifier={setVerifierInputA}
        />
      </div>
    </div>
  );
}