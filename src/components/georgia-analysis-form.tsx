"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFinalResults, getUniqueNumbersFromRawResults, findMariagePairs, FormattedResult } from "@/lib/utils";
import { findNumberInData } from "@/lib/data";
import { DateInputSection } from "./date-input-section";
import { FinalResultsSection } from "./final-results-section";
import { performGeorgiaDatabaseAnalysis } from "@/lib/analysis";
import { Loader2 } from "lucide-react";
import { GeorgiaNumberInputSection } from "./georgia-number-input-section";
import { AnalysisLog } from "@/lib/schemas";

// Define types needed internally
type MatchingResult = {
  category: string;
  subCategory: string;
  days: Record<string, number[]>;
};

type AnalysisSet = {
  id: string; // e.g., "lunMar-firstLM"
  inputIndices: number[]; // Indices of the original numbers that map to this set
  matchingResult: MatchingResult; // The actual data set (category, subCategory, days)
};

interface GeorgiaNumberAnalysisFormProps {
    location: string;
    tableName: string;
}

type GeorgiaAnalysisStep = 'input' | 'analyzing_1' | 'analyzing_2' | 'analyzing_3' | 'analyzing_4' | 'analyzing_5' | 'analyzing_6' | 'analyzing_7' | 'analyzing_8' | 'analyzing_9' | 'results';

export function GeorgiaNumberAnalysisForm({ location, tableName }: GeorgiaNumberAnalysisFormProps) {
  // 9 inputs for Day (3), Moon (3), Night (3)
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [numbers, setNumbers] = useState<string[]>(Array(9).fill(""));
  
  const [analysisSets, setAnalysisSets] = useState<AnalysisSet[]>([]);
  const [rawFinalResults, setRawFinalResults] = useState<string[]>([]);
  const [detailedLog, setDetailedLog] = useState<AnalysisLog>([]);
  const [step, setStep] = useState<GeorgiaAnalysisStep>('input');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Define the labels for the 9 inputs
  const inputLabels = [
    "1er-Day", "2em-Day", "3em-Day",
    "1er-Moon", "2em-Moon", "3em-Moon",
    "1er-Night", "2em-Night", "3em-Night"
  ];

  // Memoize the formatted results for display
  const formattedFinalResults: FormattedResult[] = useMemo(() => {
    return formatFinalResults(rawFinalResults);
  }, [rawFinalResults]);
  
  // Calculate Mariage pairs
  const mariagePairs = useMemo(() => {
    const uniqueNumbers = getUniqueNumbersFromRawResults(rawFinalResults);
    return findMariagePairs(uniqueNumbers);
  }, [rawFinalResults]);

  const handleNumberChange = (index: number, value: string) => {
    // Only allow numbers and limit to 2 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 2);
    
    const newNumbers = [...numbers];
    newNumbers[index] = numericValue;
    setNumbers(newNumbers);
  };

  // Helper function to map inputs to sets for a given range of indices
  const mapInputsToSets = (indices: number[]): AnalysisSet[] => {
    const uniqueSetsMap = new Map<string, { indices: number[], result: MatchingResult }>();
    
    indices.forEach(index => {
        const num = numbers[index];
        if (num && !isNaN(parseInt(num))) {
            const resultsForNum = findNumberInData(parseInt(num));
            
            if (resultsForNum.length > 0) {
                const result = resultsForNum[0];
                const setId = `${result.category}-${result.subCategory}`;
                
                if (!uniqueSetsMap.has(setId)) {
                    uniqueSetsMap.set(setId, { indices: [index], result });
                } else {
                    uniqueSetsMap.get(setId)!.indices.push(index);
                }
            }
        }
    });

    return Array.from(uniqueSetsMap.entries()).map(([id, data]) => ({
        id,
        inputIndices: data.indices,
        matchingResult: data.result,
    }));
  };

  // Helper function to perform Georgia analysis and return results
  const runGeorgiaAnalysisStep = async (sets: AnalysisSet[]): Promise<{ rawResults: string[], detailedLog: AnalysisLog }> => {
    if (sets.length === 0) {
        return { rawResults: [], detailedLog: [] };
    }
    
    return performGeorgiaDatabaseAnalysis(
        date!,
        tableName,
        sets,
        inputLabels,
        numbers
    );
  };

  const handleNext = async () => {
    if (!date) return;

    const validNumbers = numbers.filter(num => num && !isNaN(parseInt(num)));

    if (validNumbers.length === 0) {
        alert("Please enter at least one valid number.");
        return;
    }

    // Reset previous results
    setRawFinalResults([]);
    setDetailedLog([]);
    setAnalysisSets([]);
    setCurrentStepIndex(0);

    let currentRawResults: string[] = [];
    let currentDetailedLog: AnalysisLog = [];
    let currentAnalysisSets: AnalysisSet[] = [];

    // Check if all 9 inputs are filled with 2 digits
    const allInputsFilled = numbers.every(num => num && num.length === 2 && !isNaN(parseInt(num)));

    if (allInputsFilled) {
        // --- Nine-Step Analysis (One step per input) ---
        
        for (let i = 0; i < 9; i++) {
            setStep(`analyzing_${i + 1}` as GeorgiaAnalysisStep);
            setCurrentStepIndex(i);
            
            const currentIndices = [i];
            const currentSets = mapInputsToSets(currentIndices);
            currentAnalysisSets.push(...currentSets);

            if (currentSets.length > 0) {
                const { rawResults, detailedLog } = await runGeorgiaAnalysisStep(currentSets);
                currentRawResults.push(...rawResults);
                currentDetailedLog.push(...detailedLog);
            }
            
            // Small delay to show progress
            await new Promise(resolve => setTimeout(resolve, 300));
        }

    } else {
        // --- Single-Step Analysis (Existing logic for partial inputs) ---
        setStep('analyzing_1');
        setCurrentStepIndex(0);
        
        const allIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        const allSets = mapInputsToSets(allIndices.filter(i => numbers[i])); // Only map indices with valid input
        currentAnalysisSets.push(...allSets);

        if (allSets.length > 0) {
            const { rawResults, detailedLog } = await runGeorgiaAnalysisStep(allSets);
            currentRawResults.push(...rawResults);
            currentDetailedLog.push(...detailedLog);
        } else {
            alert("No matching data found for entered numbers.");
        }
    }

    // Finalize state
    setAnalysisSets(currentAnalysisSets);
    setRawFinalResults(currentRawResults);
    setDetailedLog(currentDetailedLog);
    setStep('results');
  };

  const resetAnalysis = () => {
    setDate(new Date());
    setNumbers(Array(9).fill(""));
    setAnalysisSets([]);
    setRawFinalResults([]);
    setDetailedLog([]);
    setStep('input');
    setCurrentStepIndex(0);
  };
  
  // Update rendering logic based on step
  const showResults = step === 'results';
  const isAnalyzing = step.startsWith('analyzing');

  // Determine loading message
  let loadingMessage = "Analyzing historical data...";
  if (isAnalyzing && currentStepIndex < 9) {
    const stepNumber = currentStepIndex + 1;
    const inputLabel = inputLabels[currentStepIndex];
    loadingMessage = `Step ${stepNumber}/9: Analyzing ${inputLabel}...`;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{location} Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter numbers and analyze their patterns across 8 preceding weeks
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Date Input Section */}
          <DateInputSection date={date} setDate={setDate} />

          {/* Number Inputs Section */}
          {step === 'input' && (
            <GeorgiaNumberInputSection 
              numbers={numbers}
              inputLabels={inputLabels}
              handleNumberChange={handleNumberChange}
              handleNext={handleNext}
            />
          )}
          
          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">{loadingMessage}</p>
                {currentStepIndex < 9 && (
                  <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${((currentStepIndex + 1) / 9) * 100}%` }}
                    ></div>
                  </div>
                )}
            </div>
          )}

          {/* Final Results Section */}
          {showResults && (
            <FinalResultsSection
              formattedFinalResults={formattedFinalResults}
              mariagePairs={mariagePairs}
              analysisSets={analysisSets}
              inputLabels={inputLabels}
              detailedLog={detailedLog}
              rawFinalResults={rawFinalResults}
              resetAnalysis={resetAnalysis}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}