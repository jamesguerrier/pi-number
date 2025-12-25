import { FormattedResult } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface HistoricalHitsDisplayProps {
    formattedFinalResults: FormattedResult[];
}

export function HistoricalHitsDisplay({ formattedFinalResults }: HistoricalHitsDisplayProps) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center border-b pb-1 mb-2">
                <h4 className="font-semibold text-lg text-green-600 dark:text-green-400">Historical Hits (Last 8 Weeks)</h4>
                <div className="flex gap-3 text-xs font-medium">
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-red-500"></span> Strict Match
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="h-3 w-3 rounded-full bg-blue-500"></span> Reverse Match
                    </span>
                </div>
            </div>
            
            <div className="max-h-60 overflow-y-auto">
                {formattedFinalResults.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {formattedFinalResults.map((result, index) => (
                            <span 
                                key={index} 
                                className={cn(
                                    "px-3 py-1 rounded-full font-mono text-lg",
                                    result.type === 'strict' 
                                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                )}
                            >
                                {result.display}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground italic">No historical hits found in the last 8 weeks.</p>
                )}
            </div>
        </div>
    );
}