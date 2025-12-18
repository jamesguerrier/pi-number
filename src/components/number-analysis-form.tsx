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
import { AnalysisLog } from "@/lib/schemas"; // Import new type

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
    tableName: string; // Added tableName prop
}

export function NumberAnalysisForm({ location, tableName }: NumberAnalysisFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [numbers, setNumbers] = useState<string[]>(["", "", "", "", "", ""]);
  
  const [analysisSets, setAnalysisSets] = useState<AnalysisSet[]>([]);
  const [rawFinalResults, setRawFinalResults] = useState<string[]>([]);
  const [detailedLog, setDetailedLog] = useState<AnalysisLog>([]); // New state for detailed log
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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

  const handleNext = async () => {
    if (!date) return;

    setIsAnalyzing(true);
    setRawFinalResults([]); // Clear previous results
    setDetailedLog([]); // Clear previous log
    setAnalysisSets([]); // Clear previous sets

    // 1. Map input numbers to unique analysis sets
    const uniqueSetsMap = new Map<string, { indices: number[], result: MatchingResult }>();
    const validNumbers = numbers.filter(num => num && !isNaN(parseInt(num)));

    if (validNumbers.length === 0) {
        alert("Please enter at least one valid number.");
        setIsAnalyzing(false);
        return;
    }

    numbers.forEach((num, index) => {
      if (num && !isNaN(parseInt(num))) {
        const resultsForNum = findNumberInData(parseInt(num));
        
        // We only use the first matching result found for a number
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

    const newAnalysisSets: AnalysisSet[] = Array.from(uniqueSetsMap.entries()).map(([id, data]) => ({
      id,
      inputIndices: data.indices,
      matchingResult: data.result,
    }));
    
    // Set the sets immediately so we can display them later
    setAnalysisSets(newAnalysisSets);
    
    if (newAnalysisSets.length > 0) {
      // 2. Perform the full database analysis (5 weeks)
      const { rawResults, detailedLog } = await performDatabaseAnalysis( // Destructure new return object
        date,
        tableName,
        newAnalysisSets,
        inputLabels,
        numbers
      );
      
      setRawFinalResults(rawResults);
      setDetailedLog(detailedLog); // Set detailed log
    } else {
      // If no sets were found, we still stop loading and show results (which will be empty)
      alert("No matching data found for entered numbers.");
    }
    
    setIsAnalyzing(false);
  };

  const resetAnalysis = () => {
    setDate(new Date());
    setNumbers(["", "", "", "", "", ""]);
    setAnalysisSets([]);
    setRawFinalResults([]);
    setDetailedLog([]); // Reset detailed log
    setIsAnalyzing(false);
  };
  
  // Show results if analysisSets were calculated AND we are not currently analyzing
  const showResults = analysisSets.length > 0 && !isAnalyzing;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{location} Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter numbers and analyze their patterns across 5 weeks
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Date Input Section */}
          <DateInputSection date={date} setDate={setDate} />

          {/* Number Inputs Section */}
          {!isAnalyzing && !showResults && (
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
                <p className="text-lg font-medium text-muted-foreground">Analyzing 5 weeks of historical data...</p>
            </div>
          )}

          {/* Final Results Section */}
          {!isAnalyzing && showResults && (
            <FinalResultsSection
              formattedFinalResults={formattedFinalResults}
              mariagePairs={mariagePairs}
              analysisSets={analysisSets}
              inputLabels={inputLabels}
              detailedLog={detailedLog} // Pass detailed log
              resetAnalysis={resetAnalysis}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}