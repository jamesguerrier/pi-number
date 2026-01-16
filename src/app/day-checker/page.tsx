"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { DayCheckerTool } from "@/components/day-checker-tool";
import { DayCheckerSide2 } from "@/components/day-checker/day-checker-side2"; // Import the new component
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"; // Import resizable components

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
      <div className="w-full max-w-full space-y-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Day Checker Boulette - Dual View</h1>
        
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[80vh] rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <DayCheckerTool />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full items-center justify-center p-6">
              <DayCheckerSide2 />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}