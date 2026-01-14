"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function DayCheckerPage() {
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
    <div className="min-h-[calc(100vh-10rem)] p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-6xl space-y-8">
        <h1 className="text-3xl font-bold">Day Checker</h1>
        {/* Content will be added here later */}
      </div>
    </div>
  );
}