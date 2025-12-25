"use client";

import { Button } from "@/components/ui/button";
import { StepLogViewer } from "./step-log-viewer";
import { useRouter } from "next/navigation";
import { getUniqueNumbersFromRawResults, getUniqueAndNonReversedNumbers } from "@/lib/utils";
import { AnalysisLog } from "@/lib/schemas";

interface ActionButtonsProps {
    rawFinalResults: string[];
    resetAnalysis: () => void;
    detailedLog: AnalysisLog;
}

export function ActionButtons({ rawFinalResults, resetAnalysis, detailedLog }: ActionButtonsProps) {
    const router = useRouter();

    const handleGoToVerify = () => {
        const uniqueNumbers = getUniqueNumbersFromRawResults(rawFinalResults);
        const filteredNumbers = getUniqueAndNonReversedNumbers(uniqueNumbers);
        const numberString = filteredNumbers.map(n => String(n).padStart(2, '0')).join(',');
        
        if (numberString) {
            router.push(`/verifier?setA=${numberString}`);
        }
    };

    return (
        <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
            <Button onClick={resetAnalysis} variant="outline" className="flex-1">
                Start New Analysis
            </Button>
            
            <StepLogViewer detailedLog={detailedLog} />
            
            <Button 
                onClick={handleGoToVerify} 
                className="flex-1 bg-green-600 hover:bg-green-700"
                disabled={rawFinalResults.length === 0}
            >
                Send to Verifier
            </Button>
        </div>
    );
}