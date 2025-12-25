"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, History, GitCompare, Loader2 } from "lucide-react";
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
              This application helps you analyze specific number patterns across **five** preceding weeks based on a selected date and location (New York, Florida, or Georgia).
            </p>
            
            <Separator />

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Zap className="h-8 w-8 text-blue-500 mx-auto" />
                <h4 className="font-semibold">Input & Set Mapping</h4>
                <p className="text-sm text-muted-foreground">
                  Enter your 2-digit numbers to instantly map them to specific historical analysis sets (Day, Moon, or Night).
                </p>
              </div>
              <div className="space-y-2">
                <History className="h-8 w-8 text-green-500 mx-auto" />
                <h4 className="font-semibold">5-Week Historical Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  We automatically check the last five weeks of historical data for matching numbers based on the mapped sets.
                </p>
              </div>
              <div className="space-y-2">
                <GitCompare className="h-8 w-8 text-purple-500 mx-auto" />
                <h4 className="font-semibold">Verify & Summarize</h4>
                <p className="text-sm text-muted-foreground">
                  View summarized results, identify Mariage pairs, and use the dedicated Verifier tool to cross-reference against known patterns.
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