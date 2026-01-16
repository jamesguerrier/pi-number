"use client";

import { useAuth } from "@/context/auth-context";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";
import { DayCheckerTool } from "@/components/day-checker-tool";
import { DayCheckerSide2 } from "@/components/day-checker/day-checker-side2";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Import Tabs components

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
        <h1 className="text-3xl font-bold mb-6 text-center">Day Checker Tools</h1>
        
        <Tabs defaultValue="day-checker-boulette" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="day-checker-boulette">Day Checker Boulette</TabsTrigger>
            <TabsTrigger value="side-2-analysis">Side 2 Analysis</TabsTrigger>
          </TabsList>
          <TabsContent value="day-checker-boulette">
            <div className="flex h-full items-center justify-center p-6">
              <DayCheckerTool />
            </div>
          </TabsContent>
          <TabsContent value="side-2-analysis">
            <div className="flex h-full items-center justify-center p-6">
              <DayCheckerSide2 />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}