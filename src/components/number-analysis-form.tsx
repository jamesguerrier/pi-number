"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn, formatFinalResults, getUniqueNumbersFromRawResults, findMariagePairs } from "@/lib/utils";
import { findNumberInData, getEnglishDayName } from "@/lib/data";
import { getPreviousWeekDates } from "@/lib/dateUtils";

type MatchingResult = {
  category: string;
  subCategory: string;
  days: Record<string, number[]>;
};

type UserAnswer = {
  inputIndex: number;
  inputLabel: string;
  number: string;
  matchingResults: MatchingResult[];
  weekAnswers: Record<number, {
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
  const [matchingResults, setMatchingResults] = useState<MatchingResult[][]>([]);
  const [currentStep, setCurrentStep] = useState<'input' | 'questions'>('input');
  const [currentInputIndex, setCurrentInputIndex] = useState<number>(0);
  const [currentWeekIndex, setCurrentWeekIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
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
    // Find matching results for all entered numbers
    const results = numbers.map(num => {
      if (num && !isNaN(parseInt(num))) {
        return findNumberInData(parseInt(num));
      }
      return [];
    });
    
    setMatchingResults(results);
    
    // Initialize user answers
    const answers: UserAnswer[] = numbers.map((num, index) => ({
      inputIndex: index,
      inputLabel: inputLabels[index],
      number: num,
      matchingResults: num && !isNaN(parseInt(num)) ? findNumberInData(parseInt(num)) : [],
      weekAnswers: {}
    }));
    
    setUserAnswers(answers);
    
    // Start with first input that has a number
    const firstInputWithNumber = numbers.findIndex(num => num && !isNaN(parseInt(num)));
    if (firstInputWithNumber >= 0) {
      setCurrentInputIndex(firstInputWithNumber);
      setCurrentStep('questions');
      
      // Always start at Week 1 (currentWeekIndex = 0, which translates to 1 week back)
      setCurrentWeekIndex(0);
    } else {
      alert("Please enter at least one number");
    }
  };

  const handleProgression = (currentInput: number, currentWeek: number) => {
    // Move to next week or next input
    if (currentWeek < 3) {
      setCurrentWeekIndex(currentWeek + 1);
      setWeekUserNumbers(["", "", ""]);
    } else {
      // Move to next input with number
      const nextInputIndex = numbers.findIndex((num, index) => 
        index > currentInput && num && !isNaN(parseInt(num))
      );
      
      if (nextInputIndex >= 0) {
        setCurrentInputIndex(nextInputIndex);
        setCurrentWeekIndex(0);
        setWeekUserNumbers(["", "", ""]);
      } else {
        // All inputs processed
        setCurrentStep('input');
      }
    }
  };

  const handleAnswer = (answer: 'yes' | 'no') => {
    if (!date) return;
    
    // Update user answer for current week
    const updatedAnswers = [...userAnswers];
    const currentAnswer = updatedAnswers[currentInputIndex];
    
    // Get the days from matching results
    const currentResults = matchingResults[currentInputIndex];
    if (currentResults.length === 0) return;
    
    const firstResult = currentResults[0];
    const days = Object.keys(firstResult.days);
    if (days.length < 2) return;
    
    // Calculate dates for this week (currentWeekIndex 0 means 1 week back, 1 means 2 weeks back, etc.)
    const weeksBack = currentWeekIndex + 1;
    const weekDates = getPreviousWeekDates(date, days[0], days[1], weeksBack);
    
    if (!currentAnswer.weekAnswers[currentWeekIndex]) {
      currentAnswer.weekAnswers[currentWeekIndex] = {
        answer: null,
        userNumbers: [],
        dates: weekDates
      };
    }
    
    currentAnswer.weekAnswers[currentWeekIndex].answer = answer;
    currentAnswer.weekAnswers[currentWeekIndex].dates = weekDates;
    
    // If NO, we proceed immediately to the next week/input
    if (answer === 'no') {
      setUserAnswers(updatedAnswers);
      handleProgression(currentInputIndex, currentWeekIndex);
    } 
    
    // If YES, we update the state to show the input fields, but progression is handled by the 'NEXT' button
    if (answer === 'yes') {
      // We don't store weekUserNumbers or update finalResults yet, as the user hasn't entered them.
      // We just set the answer to 'yes' to trigger the input fields to show.
      setUserAnswers(updatedAnswers);
    }
  };

  const handleWeekNumberChange = (index: number, value: string) => {
    const numericValue = value.replace(/\D/g, "").slice(0, 2);
    const newNumbers = [...weekUserNumbers];
    newNumbers[index] = numericValue;
    setWeekUserNumbers(newNumbers);
  };

  const handleNextAfterYes = () => {
    if (!date) return;

    const updatedAnswers = [...userAnswers];
    const currentAnswer = updatedAnswers[currentInputIndex];
    
    // Get the days from matching results
    const currentResults = matchingResults[currentInputIndex];
    if (currentResults.length === 0) return;
    
    const firstResult = currentResults[0];
    const days = Object.keys(firstResult.days);
    if (days.length < 2) return;

    // 1. Store the numbers user entered for this week
    currentAnswer.weekAnswers[currentWeekIndex].userNumbers = [...weekUserNumbers];
    
    // 2. Add to raw final results
    const newRawFinalResults = [...rawFinalResults];
    weekUserNumbers.forEach(num => {
      if (num.trim()) {
        // Store the raw result string including context, even though we only use the number for counting later
        newRawFinalResults.push(`${inputLabels[currentInputIndex]}: Week ${currentWeekIndex + 1}: ${num}`);
      }
    });
    setRawFinalResults(newRawFinalResults);
    setUserAnswers(updatedAnswers);

    // 3. Progression
    handleProgression(currentInputIndex, currentWeekIndex);
  };

  const getCurrentQuestion = () => {
    if (currentStep !== 'questions' || !date) return "";
    
    const currentResults = matchingResults[currentInputIndex];
    if (currentResults.length === 0) return "";
    
    const firstResult = currentResults[0];
    const days = Object.keys(firstResult.days);
    
    if (days.length < 2) return "";
    
    const day1 = getEnglishDayName(days[0]);
    const day2 = getEnglishDayName(days[1]);
    
    // Calculate dates for current week (currentWeekIndex 0 means 1 week back, 1 means 2 weeks back, etc.)
    const weeksBack = currentWeekIndex + 1;
    const weekDates = getPreviousWeekDates(date, days[0], days[1], weeksBack);
    const date1 = format(weekDates[days[0]], 'MMM do');
    const date2 = format(weekDates[days[1]], 'MMM do');
    
    // Get the numbers from the matching result
    const numbers1 = firstResult.days[days[0]].join(", ");
    const numbers2 = firstResult.days[days[1]].join(", ");
    
    return `For ${day1} ${date1}: [${numbers1}] and ${day2} ${date2}: [${numbers2}], do you see these numbers (including the day number)?`;
  };

  const renderMatchingResults = (results: MatchingResult[]) => {
    if (results.length === 0) return null;
    
    return results.map((result, idx) => (
      <div key={idx} className="mb-4 p-3 bg-gray-50 rounded-md dark:bg-gray-900">
        <div className="font-medium mb-2">
          {/* Iterate over all days in the set */}
          {Object.entries(result.days).map(([day, numbers]) => (
            <div key={day} className="mb-1">
              <span className="font-semibold">{getEnglishDayName(day)}</span>: [{numbers.join(", ")}]
            </div>
          ))}
        </div>
      </div>
    ));
  };

  const resetAnalysis = () => {
    setDate(new Date());
    setNumbers(["", "", "", "", "", ""]);
    setMatchingResults([]);
    setUserAnswers([]);
    setRawFinalResults([]);
    setWeekUserNumbers(["", "", ""]);
    setCurrentStep('input');
    setCurrentInputIndex(0);
    setCurrentWeekIndex(0);
  };

  const currentAnswerState = userAnswers[currentInputIndex]?.weekAnswers[currentWeekIndex]?.answer;

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
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Number Inputs Section - Only show in input step */}
          {currentStep === 'input' && (
            <div className="space-y-6">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter Six 2-Digit Numbers</label>
              
              {/* DAY Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <h3 className="text-lg font-semibold text-gray-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100 px-4 py-2 rounded-md">DAY</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400">{inputLabels[index]}</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="00"
                        value={numbers[index]}
                        onChange={(e) => handleNumberChange(index, e.target.value)}
                        className="text-center text-2xl font-bold h-14"
                        maxLength={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* MOON Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <h3 className="text-lg font-semibold text-gray-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-100 px-4 py-2 rounded-md">MOON</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[3, 4, 5].map((index) => (
                    <div key={index} className="space-y-2">
                      <label className="text-xs text-gray-500 dark:text-gray-400">{inputLabels[index]}</label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        placeholder="00"
                        value={numbers[index]}
                        onChange={(e) => handleNumberChange(index, e.target.value)}
                        className="text-center text-2xl font-bold h-14"
                        maxLength={2}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-4">
                <Button 
                  onClick={handleNext}
                  className="w-full h-12 text-lg font-semibold"
                  size="lg"
                  disabled={!numbers.some(num => num && !isNaN(parseInt(num)))}
                >
                  Analyze Numbers
                </Button>
              </div>
            </div>
          )}

          {/* Question Flow Section */}
          {currentStep === 'questions' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Analysis for: {inputLabels[currentInputIndex]} = {numbers[currentInputIndex]}
                </h3>
                
                {/* Show matching results */}
                {matchingResults[currentInputIndex]?.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Found in data:</h4>
                    {renderMatchingResults(matchingResults[currentInputIndex])}
                  </div>
                )}

                {/* Current question */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Week {currentWeekIndex + 1} of 4</h4>
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
                    <span>Input: {currentInputIndex + 1} of {numbers.filter(n => n).length}</span>
                    <span>Week: {currentWeekIndex + 1} of 4</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ 
                        width: `${((currentInputIndex * 4 + currentWeekIndex + 1) / (Math.max(1, numbers.filter(n => n).length) * 4)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Back button */}
              <Button 
                onClick={() => setCurrentStep('input')}
                variant="outline"
                className="w-full"
              >
                Back to Number Input
              </Button>
            </div>
          )}

          {/* Final Results Section */}
          {formattedFinalResults.length > 0 && currentStep === 'input' && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Final Results (Numbers you entered when answering YES)</h3>
              
              {/* Individual Hits Section */}
              <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
                <h4 className="font-semibold text-lg mb-2 border-b pb-1">Individual Hits</h4>
                {formattedFinalResults.map((result, index) => (
                  <div key={index} className="p-3 bg-white dark:bg-gray-800 rounded border font-mono text-lg">
                    {result}
                  </div>
                ))}
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

              {formattedFinalResults.length === 0 && (
                <p className="text-gray-500 italic">No numbers were recorded (all answers were NO)</p>
              )}
              <Button 
                onClick={resetAnalysis}
                className="mt-4"
                variant="outline"
              >
                Start New Analysis
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}