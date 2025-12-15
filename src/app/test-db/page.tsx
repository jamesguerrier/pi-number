"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Database, Shield, Table, Key } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function TestDBPage() {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [tablesStatus, setTablesStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [authStatus, setAuthStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [tables, setTables] = useState<string[]>([]);
  const [errorDetails, setErrorDetails] = useState<string>('');

  useEffect(() => {
    testDatabaseConnection();
  }, []);

  const testDatabaseConnection = async () => {
    try {
      // Test basic connection
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      
      if (error) {
        console.error("Database connection error:", error);
        setConnectionStatus('error');
        setErrorDetails(error.message);
      } else {
        setConnectionStatus('success');
        toast.success("Database connection successful!");
        
        // Now try to get tables
        await testTables();
      }
    } catch (err: any) {
      console.error("Connection test failed:", err);
      setConnectionStatus('error');
      setErrorDetails(err.message || 'Unknown error');
      toast.error("Database connection failed");
    }

    // Test auth
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthStatus('success');
      } else {
        setAuthStatus('success'); // No session is still valid
      }
    } catch (err) {
      console.error("Auth test failed:", err);
      setAuthStatus('error');
    }
  };

  const testTables = async () => {
    try {
      // Try to query the tables using a simpler approach
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      const { data: floridaData, error: floridaError } = await supabase
        .from('florida_data')
        .select('*')
        .limit(1);
      
      const { data: nyData, error: nyError } = await supabase
        .from('new_york_data')
        .select('*')
        .limit(1);

      const foundTables: string[] = [];
      
      if (!profilesError) foundTables.push('profiles');
      if (!floridaError) foundTables.push('florida_data');
      if (!nyError) foundTables.push('new_york_data');

      setTables(foundTables);
      
      if (foundTables.length > 0) {
        setTablesStatus('success');
        toast.success(`Found ${foundTables.length} table(s)`);
      } else {
        setTablesStatus('error');
        toast.error("No tables found");
      }
    } catch (err) {
      console.error("Tables test failed:", err);
      setTablesStatus('error');
    }
  };

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

  const handleCreateTestData = async () => {
    try {
      // Test inserting data into florida_data
      const testData = {
        complete_date: new Date().toISOString().split('T')[0],
        date_number: Math.floor(Math.random() * 100),
        first_am_day: Math.floor(Math.random() * 100),
        second_am_day: Math.floor(Math.random() * 100),
        third_am_day: Math.floor(Math.random() * 100),
        first_pm_moon: Math.floor(Math.random() * 100),
        second_pm_moon: Math.floor(Math.random() * 100),
        third_pm_moon: Math.floor(Math.random() * 100)
      };

      const { data, error } = await supabase
        .from('florida_data')
        .insert([testData])
        .select();

      if (error) {
        toast.error(`Insert failed: ${error.message}`);
      } else {
        toast.success("Test data inserted successfully!");
        
        // Now try to read it back
        const { data: readData, error: readError } = await supabase
          .from('florida_data')
          .select('*')
          .eq('id', data[0].id)
          .single();

        if (readError) {
          toast.error(`Read back failed: ${readError.message}`);
        } else {
          toast.success("Data read back successfully!");
        }
      }
    } catch (err: any) {
      toast.error(`Test failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Database Functionality Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Database Connection</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={connectionStatus} />
                <span>{getStatusText(connectionStatus)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Table className="h-5 w-5 text-green-500" />
                <span className="font-medium">Tables Access</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={tablesStatus} />
                <span>{getStatusText(tablesStatus)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Authentication</span>
              </div>
              <div className="flex items-center gap-2">
                <StatusIcon status={authStatus} />
                <span>{getStatusText(authStatus)}</span>
              </div>
            </div>
          </div>

          {tables.length > 0 && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h4 className="font-semibold mb-2">Found Tables:</h4>
              <div className="flex flex-wrap gap-2">
                {tables.map((table) => (
                  <span key={table} className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                    {table}
                  </span>
                ))}
              </div>
            </div>
          )}

          {errorDetails && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <h4 className="font-semibold text-red-700 dark:text-red-400 mb-1">Error Details:</h4>
              <code className="text-sm text-red-600 dark:text-red-300 break-all">{errorDetails}</code>
            </div>
          )}

          <div className="pt-4 border-t space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button 
                className="w-full" 
                onClick={testDatabaseConnection}
                variant="outline"
              >
                <Loader2 className="mr-2 h-4 w-4" />
                Retry Tests
              </Button>
              
              <Button 
                className="w-full" 
                onClick={handleCreateTestData}
                disabled={connectionStatus !== 'success'}
              >
                <Key className="mr-2 h-4 w-4" />
                Test CRUD Operations
              </Button>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/'}
              >
                Go to Home Page
              </Button>
              
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => window.location.href = '/health'}
              >
                View Health Check
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}