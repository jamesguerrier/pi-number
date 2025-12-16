import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEnglishDayName } from "@/lib/data";
import { downloadAnalysisPDF, captureElementAsPDF } from "@/lib/pdf-utils";
import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PDFDownloadButton } from "./pdf-download-button";

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
    formattedFinalResults: string[];
    mariagePairs: string[];
    analysisSets: AnalysisSet[];
    inputLabels: string[];
    inputNumbers: string[];
    location: string;
    date: Date;
    resetAnalysis: () => void;
}

export function FinalResultsSection({ 
    formattedFinalResults, 
    mariagePairs, 
    analysisSets, 
    inputLabels, 
    inputNumbers,
    location,
    date,
    resetAnalysis 
}: FinalResultsSectionProps) {
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

    const handleDownloadPDF = async (): Promise<boolean> => {
        setIsGeneratingPDF(true);
        try {
            const success = await downloadAnalysisPDF({
                formattedFinalResults,
                mariagePairs,
                analysisSets,
                inputLabels,
                location,
                date,
                inputNumbers
            });
            
            if (success) {
                toast.success("PDF downloaded successfully!");
            } else {
                toast.error("Failed to generate PDF. Please try again.");
            }
            return success;
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("An error occurred while generating the PDF.");
            return false;
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    const handleDownloadScreenshot = async () => {
        setIsGeneratingPDF(true);
        try {
            const success = await captureElementAsPDF('analysis-results');
            if (success) {
                toast.success("Screenshot PDF downloaded!");
            } else {
                toast.error("Failed to capture screenshot.");
            }
        } catch (error) {
            console.error("Screenshot error:", error);
            toast.error("Failed to capture screenshot.");
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    return (
        <div id="analysis-results" className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Analysis Summary</h3>
                <div className="flex gap-2">
                    <PDFDownloadButton
                        generatePDF={handleDownloadPDF}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        Download PDF
                    </PDFDownloadButton>
                    <Button 
                        onClick={handleDownloadScreenshot}
                        disabled={isGeneratingPDF}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        {isGeneratingPDF ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="h-4 w-4" />
                        )}
                        Screenshot PDF
                    </Button>
                </div>
            </div>
            
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
                            <span key={index} className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full font-mono text-lg">
                                {result}
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

            <div className="flex gap-3 pt-4">
                <Button 
                    onClick={resetAnalysis}
                    className="flex-1"
                    variant="default"
                >
                    Start New Analysis
                </Button>
                <PDFDownloadButton
                    generatePDF={handleDownloadPDF}
                    variant="outline"
                    className="flex-1 gap-2"
                >
                    Save as PDF
                </PDFDownloadButton>
            </div>
        </div>
    );
}