"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Zap, History, GitCompare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function LandingPage() {
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If user is already authenticated, show a different message
  if (session) {
    return (
      <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center p-4">
        <Card className="shadow-xl max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Welcome Back!
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              You are already signed in. Use the navigation menu to access the analysis tools.
            </p>
            <div className="flex justify-center gap-4">
              <a href="/new-york" className="text-primary hover:underline">
                Go to New York Analysis →
              </a>
            </div>
          </CardContent>
        </Card>
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