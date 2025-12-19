"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { DatabaseRecord } from "@/lib/schemas";
import { DataTable } from "./data-table";
import { DataEntryForm } from "./data-entry-form";
import { Separator } from "@/components/ui/separator";
import { subDays, format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface DataManagementPageProps {
  location: string;
  tableName: string;
}

export function DataManagementPage({ location, tableName }: DataManagementPageProps) {
  const [data, setData] = useState<DatabaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    
    // Calculate the date 30 days ago
    const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');

    const { data: records, error } = await supabase
      .from(tableName)
      .select('*')
      .gte('complete_date', thirtyDaysAgo) // Filter for the last 30 days
      .order('complete_date', { ascending: false })
      .limit(30);

    if (error) {
      toast.error(`Failed to load ${location} data: ${error.message}`);
      setData([]);
    } else {
      setData(records as DatabaseRecord[]);
    }
    setIsLoading(false);
  }, [location, tableName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-6">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.back()}
              className="self-start"
              title="Go Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2 flex-grow">
              <Database className="h-6 w-6" />
              {location} Data Management
            </CardTitle>
            <div className="w-10"></div> {/* Spacer for alignment */}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Data Entry Form */}
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Add New Record</h3>
            <DataEntryForm tableName={tableName} onSuccess={fetchData} />
          </div>

          <Separator />

          {/* Data Table Display */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Last 30 Days of Records</h3>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DataTable data={data} tableName={tableName} onUpdate={fetchData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}