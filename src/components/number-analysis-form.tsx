"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatFinalResults, getUniqueNumbersFromRawResults, findMariagePairs } from "@/lib/utils";
import { findNumberInData } from "@/lib/data";
import { DateInputSection } from "./date-input-section";
import { NumberInputSection } from "./number-input-section";
import { FinalResultsSection } from "./final-results-section";
import { performDatabaseAnalysis } from "@/lib/analysis";
import { Loader2 } from "lucide-react";
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

interface NumberAnalysisFormProps {
    location: string;
    tableName: string;
}

type AnalysisStep = 'input' | 'analyzing_day' | 'analyzing_moon' | 'results';

export function NumberAnalysisForm({ location, tableName }: NumberAnalysisFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [numbers, setNumbers] = useState<string[]>(["", "", "", "", "", ""]);
  
  const [analysisSets, setAnalysisSets] = useState<AnalysisSet[]>([]);
  const [rawFinalResults, setRawFinalResults] = useState<string[]>([]);
  const [detailedLog, setDetailedLog] = useState<AnalysisLog>([]);
  const [step, setStep] = useState<AnalysisStep>('input');

  // Define the labels for the inputs
  const inputLabels = [
    "1er-AM",
    "2em-AM", 
    "3em-AM",
    "1er-PM",
    "2em-PM",
    "3em-PM"
  ];

  // Memoize the formatted results for display
  const formattedFinalResults = useMemo(() => {
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

  // Helper function to perform analysis and return results
  const runAnalysisStep = async (sets: AnalysisSet[]): Promise<{ rawResults: string[], detailedLog: AnalysisLog }> => {
    if (sets.length === 0) {
        return { rawResults: [], detailedLog: [] };
    }
    
    return performDatabaseAnalysis(
        date!,
        tableName,
        sets,
        inputLabels,
        numbers
    );
  };

  const handleNext = async () => {
    if (!date) return;

    const allInputsFilled = numbers.every(num => num && num.length === 2 && !isNaN(parseInt(num)));
    const validNumbers = numbers.filter(num => num && !isNaN(parseInt(num)));

    if (validNumbers.length === 0) {
        alert("Please enter at least one valid number.");
        return;
    }

    // Reset previous results
    setRawFinalResults([]);
    setDetailedLog([]);
    setAnalysisSets([]);

    let currentRawResults: string[] = [];
    let currentDetailedLog: AnalysisLog = [];
    let currentAnalysisSets: AnalysisSet[] = [];

    if (allInputsFilled) {
        // --- Two-Step Analysis (Day then Moon) ---
        
        // Step 1: Day Analysis (Indices 0, 1, 2)
        setStep('analyzing_day');
        const dayIndices = [0, 1, 2];
        const daySets = mapInputsToSets(dayIndices);
        currentAnalysisSets.push(...daySets);

        if (daySets.length > 0) {
            const { rawResults, detailedLog } = await runAnalysisStep(daySets);
            currentRawResults.push(...rawResults);
            currentDetailedLog.push(...detailedLog);
        }

        // Step 2: Moon Analysis (Indices 3, 4, 5)
        setStep('analyzing_moon');
        const moonIndices = [3, 4, 5];
        const moonSets = mapInputsToSets(moonIndices);
        currentAnalysisSets.push(...moonSets);

        if (moonSets.length > 0) {
            const { rawResults, detailedLog } = await runAnalysisStep(moonSets);
            currentRawResults.push(...rawResults);
            currentDetailedLog.push(...detailedLog);
        }

    } else {
        // --- Single-Step Analysis (Existing logic) ---
        setStep('analyzing_day'); // Use 'analyzing_day' as a generic loading state for single step
        
        const allIndices = [0, 1, 2, 3, 4, 5];
        const allSets = mapInputsToSets(allIndices.filter(i => numbers[i])); // Only map indices with valid input
        currentAnalysisSets.push(...allSets);

        if (allSets.length > 0) {
            const { rawResults, detailedLog } = await runAnalysisStep(allSets);
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
    setNumbers(["", "", "", "", "", ""]);
    setAnalysisSets([]);
    setRawFinalResults([]);
    setDetailedLog([]);
    setStep('input');
  };
  
  // Update rendering logic based on step
  const showResults = step === 'results';
  const isAnalyzing = step.startsWith('analyzing');

  // Determine loading message
  let loadingMessage = "Analyzing historical data...";
  if (step === 'analyzing_day') {
    loadingMessage = "Step 1/2: Analyzing DAY numbers...";
  } else if (step === 'analyzing_moon') {
    loadingMessage = "Step 2/2: Analyzing MOON numbers...";
  }


  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{location} Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter numbers and analyze their patterns across 6 preceding weeks
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Date Input Section */}
          <DateInputSection date={date} setDate={setDate} />

          {/* Number Inputs Section */}
          {step === 'input' && (
            <NumberInputSection 
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