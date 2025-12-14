"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { getEnglishDayName } from "@/lib/data";
import { getPreviousWeekDates } from "@/lib/dateUtils";
import { MatchingResultsDisplay } from "./matching-results-display";

// Define types needed for props
type MatchingResult = {
  category: string;
  subCategory: string;
  days: Record<string, number[]>;
};

type AnalysisSet = {
  id: string;
  inputIndices: number[];
  matchingResult: MatchingResult;
  weekAnswers: Record<number, {
    answer: 'yes' | 'no' | null;
    userNumbers: string[];
    dates: Record<string, Date>;
  }>;
};

interface QuestionFlowSectionProps {
  analysisSets: AnalysisSet[];
  currentSetIndex: number;
  currentWeekIndex: number;
  date: Date;
  numbers: string[]; // All 6 input numbers
  inputLabels: string[]; // All 6 input labels
  weekUserNumbers: string[];
  handleAnswer: (answer: 'yes' | 'no') => void;
  handleWeekNumberChange: (index: number, value: string) => void;
  handleNextAfterYes: () => void;
  handleBackToInput: () => void;
}

export function QuestionFlowSection({
  analysisSets,
  currentSetIndex,
  currentWeekIndex,
  date,
  numbers,
  inputLabels,
  weekUserNumbers,
  handleAnswer,
  handleWeekNumberChange,
  handleNextAfterYes,
  handleBackToInput,
}: QuestionFlowSectionProps) {

  if (analysisSets.length === 0) return null;

  const currentSet = analysisSets[currentSetIndex];
  const currentAnswerState = currentSet.weekAnswers[currentWeekIndex]?.answer;
  const { days } = currentSet.matchingResult;
  const dayKeys = Object.keys(days);

  const getCurrentQuestion = () => {
    if (!date || dayKeys.length < 2) return "";
    
    const day1 = getEnglishDayName(dayKeys[0]);
    const day2 = getEnglishDayName(dayKeys[1]);
    
    const weeksBack = currentWeekIndex + 1;
    const weekDates = getPreviousWeekDates(date, dayKeys[0], dayKeys[1], weeksBack);
    const date1 = format(weekDates[dayKeys[0]], 'MMM do');
    const date2 = format(weekDates[dayKeys[1]], 'MMM do');
    
    const numbers1 = days[dayKeys[0]].join(", ");
    const numbers2 = days[dayKeys[1]].join(", ");
    
    // List the input numbers this question applies to
    const inputNumbers = currentSet.inputIndices.map(i => numbers[i]).join(', ');
    
    return `For input numbers (${inputNumbers}), Week ${weeksBack}: For ${day1} ${date1}: [${numbers1}] and ${day2} ${date2}: [${numbers2}], do you see these numbers (including the day number)?`;
  };

  // Calculate progress
  const totalSets = analysisSets.length;
  const totalQuestions = totalSets * 5; // Updated from 4 to 5
  const currentQuestionNumber = currentSetIndex * 5 + currentWeekIndex + 1; // Updated multiplier from 4 to 5
  const progressPercentage = (currentQuestionNumber / totalQuestions) * 100;
  
  // Determine which input labels are being analyzed
  const analyzedLabels = currentSet.inputIndices.map(i => inputLabels[i]).join(', ');
  const analyzedNumbers = currentSet.inputIndices.map(i => numbers[i]).join(', ');


  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Analysis for Inputs: {analyzedLabels} = {analyzedNumbers}
        </h3>
        
        {/* Show matching results */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Found in data:</h4>
          <MatchingResultsDisplay result={currentSet.matchingResult} />
        </div>

        {/* Current question */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Week {currentWeekIndex + 1} of 5</h4>
          <p className="text-gray-700 dark:text-gray-300">{getCurrentQuestion()}</p>
        </div>

        {/* Yes/No buttons */}
        {(currentAnswerState === null || currentAnswerState === undefined) && (
          <div className="flex gap-4 mb-6">
            <Button 
              onClick={() => handleAnswer('yes')}
              className="flex-1 h-12 bg-green-600 hover:bg-green-700"
              size="lg"
            >
              YES
            </Button>
            <Button 
              onClick={() => handleAnswer('no')}
              className="flex-1 h-12 bg-red-600 hover:bg-red-700"
              size="lg"
            >
              NO
            </Button>
          </div>
        )}

        {/* Number inputs for YES answer - Show only if answer is 'yes' */}
        {currentAnswerState === 'yes' && (
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <h4 className="font-semibold text-gray-800 dark:text-gray-100">Enter the 3 numbers you see:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <Input
                  key={index}
                  type="text"
                  inputMode="numeric"
                  placeholder="00"
                  value={weekUserNumbers[index]}
                  onChange={(e) => handleWeekNumberChange(index, e.target.value)}
                  className="text-center text-2xl font-bold h-14"
                  maxLength={2}
                />
              ))}
            </div>
            <Button 
              onClick={handleNextAfterYes}
              className="w-full h-12 mt-4"
              size="lg"
              disabled={weekUserNumbers.every(num => num === "")}
            >
              NEXT
            </Button>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Set: {currentSetIndex + 1} of {totalSets}</span>
            <span>Week: {currentWeekIndex + 1} of 5</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
              style={{ 
                width: `${progressPercentage}%` 
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <Button 
        onClick={handleBackToInput}
        variant="outline"
        className="w-full"
      >
        Back to Number Input
      </Button>
    </div>
  );
}