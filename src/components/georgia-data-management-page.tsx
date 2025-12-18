"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { GeorgiaDatabaseRecord } from "@/lib/schemas";
import { Separator } from "@/components/ui/separator";
import { subDays, format } from "date-fns";
import { GeorgiaDataTable } from "./georgia-data-table";
import { GeorgiaDataEntryForm } from "./georgia-data-entry-form";

interface GeorgiaDataManagementPageProps {
  location: string;
  tableName: string;
}

export function GeorgiaDataManagementPage({ location, tableName }: GeorgiaDataManagementPageProps) {
  const [data, setData] = useState<GeorgiaDatabaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      setData(records as GeorgiaDatabaseRecord[]);
    }
    setIsLoading(false);
  }, [location, tableName]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center justify-center gap-2">
            <Database className="h-6 w-6" />
            {location} Data Management
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Data Entry Form */}
          <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <h3 className="text-xl font-semibold mb-4">Add New Record</h3>
            <GeorgiaDataEntryForm tableName={tableName} onSuccess={fetchData} />
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
              <GeorgiaDataTable data={data} tableName={tableName} onUpdate={fetchData} />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}