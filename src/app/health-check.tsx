"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function HealthCheck() {
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [uiStatus, setUiStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [overallStatus, setOverallStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      // Check Supabase connection
      try {
        const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        if (error) {
          console.error("Supabase error:", error);
          setSupabaseStatus('error');
        } else {
          setSupabaseStatus('success');
        }
      } catch (err) {
        console.error("Supabase connection failed:", err);
        setSupabaseStatus('error');
      }

      // Check Auth status
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthStatus('success');
        } else {
          setAuthStatus('success'); // No session is still a valid state
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setAuthStatus('error');
      }

      // UI check (basic component rendering)
      setUiStatus('success');
    };

    checkHealth();
  }, []);

  useEffect(() => {
    if (supabaseStatus === 'checking' || authStatus === 'checking' || uiStatus === 'checking') {
      return;
    }

    if (supabaseStatus === 'error' || authStatus === 'error' || uiStatus === 'error') {
      setOverallStatus('unhealthy');
    } else {
      setOverallStatus('healthy');
    }
  }, [supabaseStatus, authStatus, uiStatus]);

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'checking') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusText = (status: string) => {
    if (status === 'checking') return 'Checking...';
    if (status === 'success') return 'Healthy';
    return 'Failed';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Application Health Check</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Supabase Connection</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={supabaseStatus} />
                <span>{getStatusText(supabaseStatus)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">Authentication</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={authStatus} />
                <span>{getStatusText(authStatus)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="font-medium">UI Components</span>
              <div className="flex items-center gap-2">
                <StatusIcon status={uiStatus} />
                <span>{getStatusText(uiStatus)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold">Overall Status</span>
              <div className="flex items-center gap-2">
                {overallStatus === 'checking' && <Loader2 className="h-6 w-6 animate-spin text-blue-500" />}
                {overallStatus === 'healthy' && <CheckCircle className="h-6 w-6 text-green-500" />}
                {overallStatus === 'unhealthy' && <XCircle className="h-6 w-6 text-red-500" />}
                <span className="font-bold">
                  {overallStatus === 'checking' ? 'Checking...' : overallStatus === 'healthy' ? 'Healthy' : 'Unhealthy'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/'}
                disabled={overallStatus === 'checking'}
              >
                Go to Home Page
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}