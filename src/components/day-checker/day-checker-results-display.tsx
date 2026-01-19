"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Send } from 'lucide-react';
import { DayMatchResult, DAY_COLOR_MAP, FoundNumberWithType } from '@/lib/dayCheckerTypes'; // Import FoundNumberWithType
import { cn } from '@/lib/utils'; // Import cn for conditional classnames

interface DayCheckerResultsDisplayProps {
    isLoading: boolean;
    results: DayMatchResult[] | null;
    // totalSummary now includes an array of all day summaries
    totalSummary: {
        totalArraysFound: number;
        totalNumbersMatched: number;
        day1: { name: string; totalArraysFound: number; totalNumbersMatched: number; };
        day2: { name: string; totalArraysFound: number; totalNumbersMatched: number; };
        allDaySummaries?: { name: string; totalArraysFound: number; totalNumbersMatched: number; }[]; // Optional for backward compatibility
    } | null;
    allFoundNumbersInResults: Set<number>;
    handleTransferToVerifier: () => void;
}

export function DayCheckerResultsDisplay({
    isLoading,
    results,
    totalSummary,
    allFoundNumbersInResults,
    handleTransferToVerifier,
}: DayCheckerResultsDisplayProps) {
    return (
        <div id="result" className="p-5 min-h-32 border-2 rounded-xl bg-muted/50 border-border shadow-inner">
            {isLoading ? (
                <div className="flex justify-center items-center h-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : results && results.length > 0 ? (
                <div className="space-y-4">
                    {results.map((dayResult, index) => (
                        <div key={index} className="day-section p-4 border-l-4 border-green-500 rounded-lg shadow-sm bg-card dark:bg-gray-900">
                            <h4 className="day-title font-bold text-lg text-foreground mb-2 capitalize flex items-center">
                                <span className="day-color-indicator w-5 h-5 rounded mr-2" style={{ backgroundColor: dayResult.indicatorColor }}></span>
                                {dayResult.name} Matches ({dayResult.totalArraysFound} arrays found):
                            </h4>
                            {dayResult.matches.length > 0 ? (
                                dayResult.matches.map((match, matchIndex) => (
                                    <div key={matchIndex} className="match-info p-3 rounded-lg mt-2 border-l-4 border-blue-500 bg-muted/50">
                                        <div className="match-numbers font-bold text-foreground">Array: [{match.array.map(n => String(n).padStart(2, '0')).join(', ')}]</div>
                                        <div className="match-numbers">
                                            Found {match.foundNumbers.length}/{match.totalInArray} numbers: [
                                            {match.foundNumbers.map((foundNum: FoundNumberWithType, i: number) => (
                                                <span
                                                    key={i}
                                                    className={cn(
                                                        "font-bold",
                                                        foundNum.type === 'strict' ? "text-red-500" : "text-blue-500"
                                                    )}
                                                >
                                                    {String(foundNum.number).padStart(2, '0')}
                                                    {i < match.foundNumbers.length - 1 ? ', ' : ''}
                                                </span>
                                            ))}
                                            ]
                                        </div>
                                        <div className="match-location text-sm text-muted-foreground">Location: {match.location}</div>
                                        <div className="match-location text-sm text-muted-foreground">Match: {match.percentage}% ({match.foundNumbers.length} of {match.totalInArray})</div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-match text-muted-foreground italic">No matches found for {dayResult.name}</div>
                            )}
                        </div>
                    ))}
                    
                    {/* Dynamic Summary Section */}
                    {totalSummary && (
                        <div className="match-info p-3 rounded-lg mt-4 border-l-4 border-purple-500 bg-muted/50">
                            <div className="match-numbers font-bold text-foreground">Summary:</div>
                            <div className="match-location text-sm text-muted-foreground">Total arrays with matches: {totalSummary.totalArraysFound}</div>
                            <div className="match-location text-sm text-muted-foreground">Total numbers matched: {totalSummary.totalNumbersMatched}</div>
                            {/* Iterate over allDaySummaries if available, otherwise fallback to day1/day2 */}
                            {totalSummary.allDaySummaries && totalSummary.allDaySummaries.length > 0 ? (
                                totalSummary.allDaySummaries.map((daySummary, index) => (
                                    <div key={`summary-${index}`} className="match-location text-sm text-muted-foreground">
                                        {daySummary.name}: {daySummary.totalArraysFound} arrays ({daySummary.totalNumbersMatched} numbers)
                                    </div>
                                ))
                            ) : (
                                <>
                                    {totalSummary.day1.name && (
                                        <div className="match-location text-sm text-muted-foreground">
                                            {totalSummary.day1.name}: {totalSummary.day1.totalArraysFound} arrays ({totalSummary.day1.totalNumbersMatched} numbers)
                                        </div>
                                    )}
                                    {totalSummary.day2.name && (
                                        <div className="match-location text-sm text-muted-foreground">
                                            {totalSummary.day2.name}: {totalSummary.day2.totalArraysFound} arrays ({totalSummary.day2.totalNumbersMatched} numbers)
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* New Transfer Button */}
                    <div className="mt-6">
                        <Button
                            onClick={handleTransferToVerifier}
                            className="w-full gap-2"
                            disabled={allFoundNumbersInResults.size === 0}
                        >
                            <Send className="h-4 w-4" />
                            Transfer {allFoundNumbersInResults.size} Number(s) to Verifier Set A
                        </Button>
                    </div>
                </div>
            ) : (
                <p className="text-muted-foreground italic">Click a button to search for matches.</p>
            )}
        </div>
    );
}