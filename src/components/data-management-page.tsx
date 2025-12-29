"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Database, ArrowLeft, ChevronDown } from "lucide-react";
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

const INITIAL_LIMIT = 30;
const LOAD_MORE_STEP = 30;

export function DataManagementPage({ location, tableName }: DataManagementPageProps) {
  const [data, setData] = useState<DatabaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(INITIAL_LIMIT);
  const [hasMore, setHasMore] = useState(true);
  const router = useRouter();

  const fetchData = useCallback(async (currentLimit: number) => {
    setIsLoading(true);
    
    // Calculate the date 30 days ago (This filter is now removed to allow loading older data)
    // We rely solely on LIMIT and OFFSET for pagination now.

    const { data: records, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .order('complete_date', { ascending: false })
      .limit(currentLimit);

    if (error) {
      toast.error(`Failed to load ${location} data: ${error.message}`);
      setData([]);
      setHasMore(false);
    } else {
      setData(records as DatabaseRecord[]);
      // Check if we loaded fewer records than the current limit, indicating no more data
      setHasMore(records.length === currentLimit);
    }
    setIsLoading(false);
  }, [location, tableName]);

  useEffect(() => {
    // Fetch data whenever the limit changes (or on initial load)
    fetchData(limit);
  }, [limit, fetchData]);
  
  const handleLoadMore = () => {
    setLimit(prevLimit => prevLimit + LOAD_MORE_STEP);
  };

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
            <DataEntryForm tableName={tableName} onSuccess={() => fetchData(limit)} />
          </div>

          <Separator />

          {/* Data Table Display */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Records ({data.length} shown)</h3>
            {isLoading && data.length === 0 ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <DataTable data={data} tableName={tableName} onUpdate={() => fetchData(limit)} />
                
                {hasMore && (
                  <div className="mt-6 text-center">
                    <Button 
                      onClick={handleLoadMore} 
                      disabled={isLoading}
                      variant="outline"
                      className="gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                      Load More Records ({LOAD_MORE_STEP})
                    </Button>
                  </div>
                )}
                {!hasMore && data.length > 0 && (
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        You have reached the end of the available records.
                    </p>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}