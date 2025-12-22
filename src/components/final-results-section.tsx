import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEnglishDayName } from "@/lib/data";
import { FormattedResult, cn, getUniqueNumbersFromRawResults, getUniqueAndNonReversedNumbers } from "@/lib/utils";
import { AnalysisLog } from "@/lib/schemas";
import { StepLogViewer } from "./step-log-viewer";
import { useRouter } from "next/navigation";

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

export function FinalResultsSection({ formattedFinalResults, mariagePairs, analysisSets, inputLabels, detailedLog, rawFinalResults, resetAnalysis }: FinalResultsSectionProps) {
    const router = useRouter();

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
                    <h4 className="font-semibold text-lg text-green-600 dark:text-green-400">Historical Hits (Last 5 Weeks)</h4>
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
                        <p className="text-gray-500 italic">No historical matches found across the last 5 weeks.</p>
                    )}
                </div>
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