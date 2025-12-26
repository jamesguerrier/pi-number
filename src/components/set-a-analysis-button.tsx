"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { ListChecks, Info } from 'lucide-react';
import { cn, reverseNumber } from '@/lib/utils';
import { findNumberInData, getEnglishDayName } from '@/lib/data';

interface SetAAnalysisButtonProps {
    inputA: string;
}

// Helper function to parse input (copied from VerifierTool)
function parseInput(value: string): number[] {
  return value
    .split(',')
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v) && v >= 0 && v <= 99);
}

interface GroupedHit {
    number: number;
    matchType: 'strict' | 'reverse';
    originalInput: number;
}

type GroupedResults = Record<string, GroupedHit[]>;

export function SetAAnalysisButton({ inputA }: SetAAnalysisButtonProps) {
    const numbers = useMemo(() => parseInput(inputA), [inputA]);
    const [isOpen, setIsOpen] = useState(false);

    const groupedResults: GroupedResults = useMemo(() => {
        const results: GroupedResults = {};

        numbers.forEach(inputNum => {
            const sets = findNumberInData(inputNum);
            const reversedInputNum = reverseNumber(inputNum);

            sets.forEach(set => {
                // Iterate over the days in the set (e.g., lundi, mardi)
                Object.entries(set.days).forEach(([frenchDay, targetNumbers]) => {
                    const englishDay = getEnglishDayName(frenchDay);
                    
                    let matchType: 'strict' | 'reverse' | null = null;
                    let numberFound: number | null = null;

                    // Check for strict match (inputNum is in targetNumbers)
                    if (targetNumbers.includes(inputNum)) {
                        matchType = 'strict';
                        numberFound = inputNum;
                    } 
                    // Check for reverse match (reversedInputNum is in targetNumbers)
                    else if (targetNumbers.includes(reversedInputNum)) {
                        matchType = 'reverse';
                        numberFound = inputNum; // We display the original input number
                    }

                    if (matchType && numberFound !== null) {
                        if (!results[englishDay]) {
                            results[englishDay] = [];
                        }
                        
                        // Prevent duplicates (same input number, same match type, same day)
                        const isDuplicate = results[englishDay].some(
                            hit => hit.originalInput === inputNum && hit.matchType === matchType
                        );

                        if (!isDuplicate) {
                            results[englishDay].push({
                                number: numberFound,
                                matchType,
                                originalInput: inputNum,
                            });
                        }
                    }
                });
            });
        });
        
        // Sort results within each day group by the original input number
        Object.keys(results).forEach(day => {
            results[day].sort((a, b) => a.originalInput - b.originalInput);
        });

        return results;
    }, [numbers]);

    const dayNames = useMemo(() => {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return Object.keys(groupedResults).sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    }, [groupedResults]);

    const totalHits = Object.values(groupedResults).flat().length;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button 
                    variant="outline" 
                    className="w-full gap-2"
                    disabled={numbers.length === 0}
                >
                    <ListChecks className="h-4 w-4" />
                    Analyze Set A by Day
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Set A Analysis by Day Name</DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="flex-grow p-4 border rounded-lg bg-background">
                    {numbers.length === 0 ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Info className="h-4 w-4" />
                            <span>Please enter numbers in Input Set A (Green) to analyze.</span>
                        </div>
                    ) : totalHits === 0 ? (
                        <p className="text-center text-muted-foreground py-10">
                            None of the numbers in Set A match any known analysis set in the historical data structure.
                        </p>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-sm text-muted-foreground">
                                The numbers below are from Input Set A, grouped by the day names they correspond to in the analysis data sets.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {dayNames.map((dayName) => (
                                    <Card key={dayName} className="p-3 bg-white dark:bg-gray-800">
                                        <CardContent className="p-0 space-y-2">
                                            <h5 className="font-bold text-md text-primary border-b pb-1">{dayName}</h5>
                                            <div className="flex flex-wrap gap-2 pt-2">
                                                {groupedResults[dayName].map((hit, index) => (
                                                    <span 
                                                        key={index} 
                                                        className={cn(
                                                            "px-2 py-0.5 rounded font-mono text-sm font-semibold",
                                                            hit.matchType === 'strict' 
                                                                ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                                                : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                                        )}
                                                        title={`Original Input: ${String(hit.originalInput).padStart(2, '0')}, Match Type: ${hit.matchType}`}
                                                    >
                                                        {String(hit.number).padStart(2, '0')}
                                                    </span>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}