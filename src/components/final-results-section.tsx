"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEnglishDayName } from "@/lib/data";
import { FormattedResult, cn, getUniqueNumbersFromRawResults, getUniqueAndNonReversedNumbers } from "@/lib/utils";
import { AnalysisLog, AnalysisLogEntry } from "@/lib/schemas";
import { StepLogViewer } from "./step-log-viewer";
import { useRouter } from "next/navigation";
import { getDayNameFromDate } from "@/lib/dateUtils";
import { parseISO } from "date-fns";

// Define types needed internally for display
interface MatchingResult {
    category: string;
    subCategory: string;
    days: Record<string, number[]>;
}

interface AnalysisSet {
    id: string;
    inputIndices: number[];
    matchingResult: MatchingResult;
}

interface FinalResultsSectionProps {
    formattedFinalResults: FormattedResult[];
    mariagePairs: string[];
    analysisSets: AnalysisSet[];
    inputLabels: string[];
    detailedLog: AnalysisLog;
    rawFinalResults: string[]; // Added raw results
    resetAnalysis: () => void;
}

// Helper types for grouping
interface DayHit {
    number: number;
    type: 'strict' | 'reverse';
}
type GroupedDayHits = Record<string, DayHit[]>;

/**
 * Processes the detailed log to group all historical hits by the English day name 
 * (e.g., Monday, Tuesday) where the hit occurred.
 */
function groupHitsByDay(detailedLog: AnalysisLog): GroupedDayHits {
    const grouped: GroupedDayHits = {};

    detailedLog.forEach(entry => {
        entry.weekChecks.forEach(check => {
            check.historicalHits.forEach(hit => {
                // hit.date is a string 'yyyy-MM-dd'
                const dateObj = parseISO(hit.date);
                const dayName = getDayNameFromDate(dateObj); // e.g., "Monday"
                
                if (!grouped[dayName]) {
                    grouped[dayName] = [];
                }
                
                // Check for duplicates: only add unique number/type combinations per day
                const isDuplicate = grouped[dayName].some(
                    existingHit => existingHit.number === hit.numberFound && existingHit.type === hit.matchType
                );

                if (!isDuplicate) {
                    grouped[dayName].push({
                        number: hit.numberFound,
                        type: hit.matchType
                    });
                }
            });
        });
    });
    
    // Sort the numbers within each day group
    for (const day in grouped) {
        grouped[day].sort((a, b) => a.number - b.number);
    }

    return grouped;
}


export function FinalResultsSection({ formattedFinalResults, mariagePairs, analysisSets, inputLabels, detailedLog, rawFinalResults, resetAnalysis }: FinalResultsSectionProps) {
    const router = useRouter();
    
    // Calculate grouped day hits
    const groupedDayHits = groupHitsByDay(detailedLog);
    const dayNames = Object.keys(groupedDayHits).sort((a, b) => {
        // Custom sort order for days of the week (starting Monday)
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    const handleGoToVerify = () => {
        const uniqueNumbers = getUniqueNumbersFromRawResults(rawFinalResults);
        // Filter the list to remove duplicates and ensure no number and its reverse are both present
        const filteredNumbers = getUniqueAndNonReversedNumbers(uniqueNumbers);
        
        // Format numbers as a comma-separated string, ensuring 2 digits for consistency
        const numberString = filteredNumbers.map(n => String(n).padStart(2, '0')).join(',');
        
        if (numberString) {
            router.push(`/verifier?setA=${numberString}`);
        }
    };

    return (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Analysis Summary</h3>
            
            {/* Intermediate Mapping Section */}
            {analysisSets.length > 0 && (
                <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
                    <h4 className="font-semibold text-lg border-b pb-2 text-primary">Input Number Mappings (Found in Data)</h4>
                    {analysisSets.map((set) => {
                        const inputLabelsForSet = set.inputIndices.map(index => inputLabels[index]);
                        const dayEntries = Object.entries(set.matchingResult.days);

                        return (
                            <Card key={set.id} className="p-4 bg-gray-50 dark:bg-gray-900 border-l-4 border-blue-500">
                                <CardContent className="p-0 space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Triggered by: <span className="font-bold text-blue-600 dark:text-blue-400">{inputLabelsForSet.join(', ')}</span>
                                    </p>
                                    <p className="font-mono text-sm">
                                        Set: {set.matchingResult.category} - {set.matchingResult.subCategory}
                                    </p>
                                    <div className="space-y-1 pt-2">
                                        {dayEntries.map(([frenchDay, numbers]) => (
                                            <p key={frenchDay} className="text-sm">
                                                <span className="font-semibold capitalize">{getEnglishDayName(frenchDay)}:</span> {numbers.join(', ')}
                                            </p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Individual Hits Section */}
            <div className="space-y-2">
                <div className="flex justify-between items-center border-b pb-1 mb-2">
                    <h4 className="font-semibold text-lg text-green-600 dark:text-green-400">Historical Hits (Last 7 Weeks)</h4>
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
                                        // Conditional styling based on match type
                                        result.type === 'strict' 
                                            ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" // Strict matches (Red)
                                            : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" // Reverse matches (Blue)
                                    )}
                                >
                                    {result.display}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No historical matches found across the last 7 weeks.</p>
                    )}
                </div>
            </div>

            {/* New Day Hits Section */}
            {dayNames.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-lg mb-2 border-b pb-1 text-purple-600 dark:text-purple-400">
                        Historical Hits and Day Name (Last 7 Weeks)
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dayNames.map((dayName) => (
                            <Card key={dayName} className="p-3 bg-white dark:bg-gray-800">
                                <CardContent className="p-0 space-y-2">
                                    <h5 className="font-bold text-md text-primary border-b pb-1">{dayName}</h5>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {groupedDayHits[dayName].map((hit, index) => (
                                            <span 
                                                key={index} 
                                                className={cn(
                                                    "px-2 py-0.5 rounded font-mono text-sm font-semibold",
                                                    hit.type === 'strict' 
                                                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                                )}
                                            >
                                                {String(hit.number).padStart(2, '0')}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-3 pt-4">
                <Button 
                    onClick={resetAnalysis}
                    className="w-full md:w-1/3"
                    variant="default"
                >
                    Start New Analysis
                </Button>
                <Button 
                    onClick={handleGoToVerify}
                    className="w-full md:w-1/3"
                    variant="secondary"
                    disabled={formattedFinalResults.length === 0}
                >
                    Go to Verifier
                </Button>
                <StepLogViewer detailedLog={detailedLog} />
            </div>
        </div>
    );
}