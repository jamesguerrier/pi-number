"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, Calendar, ListChecks, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { isLoading, session } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session) {
      // If authenticated, redirect to the default protected page
      router.replace('/new-york');
    }
  }, [isLoading, session, router]);

  if (isLoading || session) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <div className="max-w-3xl w-full space-y-8">
        <Card className="shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-extrabold text-primary">
              Welcome to PI-Number Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <p className="text-lg text-muted-foreground">
              This application helps you analyze specific number patterns across four preceding weeks based on a selected date and location.
            </p>
            
            <Separator />

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Zap className="h-8 w-8 text-blue-500 mx-auto" />
                <h4 className="font-semibold">Enter Numbers</h4>
                <p className="text-sm text-muted-foreground">
                  Input six 2-digit numbers to find matching patterns in our dataset.
                </p>
              </div>
              <div className="space-y-2">
                <Calendar className="h-8 w-8 text-green-500 mx-auto" />
                <h4 className="font-semibold">Analyze History</h4>
                <p className="text-sm text-muted-foreground">
                  Review patterns across the four weeks immediately preceding your selected date.
                </p>
              </div>
              <div className="space-y-2">
                <ListChecks className="h-8 w-8 text-purple-500 mx-auto" />
                <h4 className="font-semibold">Track Results</h4>
                <p className="text-sm text-muted-foreground">
                  Record numbers you observe to generate a final, summarized list of recurring hits.
                </p>
              </div>
            </div>
            
            <Separator />

            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please sign in to begin your analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}