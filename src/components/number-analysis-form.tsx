"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatFinalResults, getUniqueNumbersFromRawResults, findMariagePairs } from "@/lib/utils";
import { findNumberInData } from "@/lib/data";
import { getPreviousWeekDates } from "@/lib/dateUtils";
import { DateInputSection } from "./date-input-section";
import { NumberInputSection } from "./number-input-section";
import { QuestionFlowSection } from "./question-flow-section";
import { FinalResultsSection } from "./final-results-section";

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
  weekAnswers: Record<number, { // 0 to 3 for weeks 1 to 4
    answer: 'yes' | 'no' | null;
    userNumbers: string[];
    dates: Record<string, Date>;
  }>;
};

interface NumberAnalysisFormProps {
    location: string;
}

export function NumberAnalysisForm({ location }: NumberAnalysisFormProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [numbers, setNumbers] = useState<string[]>(["", "", "", "", "", ""]);
  
  // NEW STATE STRUCTURE for grouped analysis
  const [analysisSets, setAnalysisSets] = useState<AnalysisSet[]>([]);
  const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
  
  const [currentStep, setCurrentStep] = useState<'input' | 'questions'>('input');
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
  const [weekUserNumbers, setWeekUserNumbers] = useState<string[]>(["", "", ""]);
  const [rawFinalResults, setRawFinalResults] = useState<string[]>([]);

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

  const handleNext = () => {
    if (!date) return;

    // 1. Map input numbers to unique analysis sets
    const uniqueSetsMap = new Map<string, { indices: number[], result: MatchingResult }>();

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
      weekAnswers: {}
    }));
    
    setAnalysisSets(newAnalysisSets);
    
    if (newAnalysisSets.length > 0) {
      setCurrentSetIndex(0);
      setCurrentWeekIndex(0);
      setCurrentStep('questions');
    } else {
      alert("No matching data found for entered numbers.");
    }
  };

  const handleProgression = (currentSet: number, currentWeek: number) => {
    // Move to next week or next set
    if (currentWeek < 3) {
      setCurrentWeekIndex(currentWeek + 1);
      setWeekUserNumbers(["", "", ""]);
    } else {
      // Move to next set
      if (currentSet < analysisSets.length - 1) {
        setCurrentSetIndex(currentSet + 1);
        setCurrentWeekIndex(0);
        setWeekUserNumbers(["", "", ""]);
      } else {
        // All sets processed
        setCurrentStep('input');
      }
    }
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (!date || analysisSets.length === 0) return;
    
    const updatedSets = [...analysisSets];
    const currentSet = updatedSets[currentSetIndex];
    
    const { days } = currentSet.matchingResult;
    const dayKeys = Object.keys(days);
    if (dayKeys.length < 2) return;
    
    const weeksBack = currentWeekIndex + 1;
    const weekDates = getPreviousWeekDates(date, dayKeys[0], dayKeys[1], weeksBack);
    
    // Record the answer and dates for this specific set/week
    currentSet.weekAnswers[currentWeekIndex] = {
      answer: answer,
      userNumbers: [], 
      dates: weekDates
    };
    
    setAnalysisSets(updatedSets);
    
    // If NO, we proceed immediately to the next week/set
    if (answer === 'no') {
      handleProgression(currentSetIndex, currentWeekIndex);
    } 
    // If YES, we wait for user input via handleNextAfterYes
  };

  const handleWeekNumberChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 2);
    const newNumbers = [...weekUserNumbers];
    newNumbers[index] = numericValue;
    setWeekUserNumbers(newNumbers);
  };

  const handleNextAfterYes = () => {
    if (!date || analysisSets.length === 0) return;

    const updatedSets = [...analysisSets];
    const currentSet = updatedSets[currentSetIndex];
    
    // 1. Store the numbers user entered for this week
    currentSet.weekAnswers[currentWeekIndex].userNumbers = [...weekUserNumbers];
    
    // 2. Add to raw final results, attributing to ALL original input indices
    const newRawFinalResults = [...rawFinalResults];
    
    currentSet.inputIndices.forEach(inputIndex => {
      const inputLabel = inputLabels[inputIndex];
      const weekNumber = currentWeekIndex + 1;
      
      weekUserNumbers.forEach(num => {
        if (num.trim()) {
          // Store the raw result string including context
          newRawFinalResults.push(`${inputLabel}: Week ${weekNumber}: ${num}`);
        }
      });
    });
    
    setRawFinalResults(newRawFinalResults);
    setAnalysisSets(updatedSets);

    // 3. Progression
    handleProgression(currentSetIndex, currentWeekIndex);
  };

  const resetAnalysis = () => {
    setDate(new Date());
    setNumbers(["", "", "", "", "", ""]);
    setAnalysisSets([]);
    setRawFinalResults([]);
    setWeekUserNumbers(["", "", ""]);
    setCurrentStep('input');
    setCurrentSetIndex(0);
    setCurrentWeekIndex(0);
  };
  
  // Helper function for QuestionFlowSection to go back to input
  const handleBackToInput = () => {
    setCurrentStep('input');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{location} Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter numbers and analyze their patterns across 4 weeks
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Date Input Section */}
          <DateInputSection date={date} setDate={setDate} />

          {/* Number Inputs Section - Only show in input step */}
          {currentStep === 'input' && (
            <NumberInputSection 
              numbers={numbers}
              inputLabels={inputLabels}
              handleNumberChange={handleNumberChange}
              handleNext={handleNext}
            />
          )}

          {/* Question Flow Section */}
          {currentStep === 'questions' && analysisSets.length > 0 && date && (
            <QuestionFlowSection
              analysisSets={analysisSets}
              currentSetIndex={currentSetIndex}
              currentWeekIndex={currentWeekIndex}
              date={date}
              numbers={numbers}
              inputLabels={inputLabels}
              weekUserNumbers={weekUserNumbers}
              handleAnswer={handleAnswer}
              handleWeekNumberChange={handleWeekNumberChange}
              handleNextAfterYes={handleNextAfterYes}
              handleBackToInput={handleBackToInput}
            />
          )}

          {/* Final Results Section */}
          {currentStep === 'input' && (rawFinalResults.length > 0 || analysisSets.length > 0) && (
            <FinalResultsSection
              formattedFinalResults={formattedFinalResults}
              mariagePairs={mariagePairs}
              resetAnalysis={resetAnalysis}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}