import { Button } from "@/components/ui/button";

interface FinalResultsSectionProps {
    formattedFinalResults: string[];
    mariagePairs: string[];
    resetAnalysis: () => void;
}

export function FinalResultsSection({ formattedFinalResults, mariagePairs, resetAnalysis }: FinalResultsSectionProps) {
    return (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Final Results (Numbers you entered when answering YES)</h3>
            
            {/* Individual Hits Section */}
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                <h4 className="font-semibold text-lg mb-2 border-b pb-1">Individual Hits</h4>
                {formattedFinalResults.length > 0 ? (
                    formattedFinalResults.map((result, index) => (
                        <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border font-mono text-lg">
                            {result}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No numbers were recorded (all answers were NO)</p>
                )}
            </div>

            {/* Mariage Section */}
            {mariagePairs.length > 0 && (
                <div className="space-y-2 mb-6">
                    <h4 className="font-semibold text-lg mb-2 border-b pb-1">Mariage</h4>
                    <div className="flex flex-wrap gap-3">
                        {mariagePairs.map((pair, index) => (
                            <span key={index} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full font-mono text-sm">
                                {pair}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <Button 
                onClick={resetAnalysis}
                className="mt-4"
                variant="outline"
            >
                Start New Analysis
            </Button>
        </div>
    );
}