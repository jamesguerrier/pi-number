import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEnglishDayName } from "@/lib/data";
import { FormattedResult, cn } from "@/lib/utils";
import { AnalysisLog } from "@/lib/schemas";
import { StepLogViewer } from "./step-log-viewer";

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
    detailedLog: AnalysisLog; // New prop
    resetAnalysis: () => void;
}

export function FinalResultsSection({ formattedFinalResults, mariagePairs, analysisSets, inputLabels, detailedLog, resetAnalysis }: FinalResultsSectionProps) {
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
            <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="font-semibold text-lg mb-2 border-b pb-1 text-green-600 dark:text-green-400">Historical Hits (Last 5 Weeks)</h4>
                {formattedFinalResults.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                        {formattedFinalResults.map((result, index) => (
                            <span 
                                key={index} 
                                className={cn(
                                    "px-3 py-1 rounded-full font-mono text-lg",
                                    // Conditional styling based on match type
                                    result.type === 'strict' 
                                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" // Highlight strict matches
                                        : "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" // Default/other matches
                                )}
                            >
                                {result.display}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No historical matches found across the last 5 weeks.</p>
                )}
            </div>

            {/* Mariage Section */}
            {mariagePairs.length > 0 && (
                <div className="space-y-2">
                    <h4 className="font-semibold text-lg mb-2 border-b pb-1 text-purple-600 dark:text-purple-400">Mariage Pairs (Shared Digit)</h4>
                    <div className="flex flex-wrap gap-3">
                        {mariagePairs.map((pair, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full font-mono text-sm">
                                {pair}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-3 pt-4">
                <Button 
                    onClick={resetAnalysis}
                    className="w-full md:w-1/2"
                    variant="default"
                >
                    Start New Analysis
                </Button>
                <StepLogViewer detailedLog={detailedLog} />
            </div>
        </div>
    );
}