"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DateInputSection } from '../date-input-section';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

// Import shared types and constants
import {
    DAY_COLOR_MAP,
    DayKey,
    MatchDetail,
    DayMatchResult,
    MinimalRecord,
    LOCATION_MAP,
} from '@/lib/dayCheckerTypes';

// Import sub-components
import { LocationLoadButtons } from './location-load-buttons';
import { DayCheckerInputGrid } from './day-checker-input-grid';
import { DayCheckerResultsDisplay } from './day-checker-results-display';
import { DayCheckerSide2ActionButtons } from './day-checker-side2-action-buttons'; // New action buttons

// Independent data for Side 2's "Search Matches" functionality
const SIDE2_MATCH_DATA: number[][] = [
    [20, 78, 83, 51], [21, 45, 36, 32], [22, 1, 68, 89], [23, 15, 48, 84], [24, 81, 38, 54], [25, 5, 6, 95], [26, 30, 59, 46], [27, 2, 62, 94], [14, 57, 87, 74], [28, 4, 79, 73], [29, 72, 34, 80], [31, 55, 69, 61], [33, 66, 76, 39], [71, 91, 63, 88], [92, 75, 56, 9], [12, 64, 86, 10], [82, 3, 43, 35], [16, 93, 53, 98], [96, 11, 44, 65], [42, 99, 97, 8], [19, 70, 58, 0], [17, 49, 67, 37], [18, 7, 52, 13], [90, 40, 47, 77], [85, 41, 50, 60], [21, 20, 23, 97]
];

// --- Component ---

export function DayCheckerSide2() {
    // State for 18 inputs (3 rows * 2 groups * 3 inputs)
    const [inputs, setInputs] = useState<string[]>(Array(18).fill(""));
    const [results, setResults] = useState<DayMatchResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [baseDate, setBaseDate] = useState<Date | undefined>(new Date());
    // State to track which input index should be highlighted and with which day's style
    const [highlightedInputs, setHighlightedInputs] = useState<Record<number, string | null>>({});

    const router = useRouter();

    // Memoized set of all unique numbers from the *historical arrays* where a match was found
    const allFoundNumbersInResults = useMemo(() => {
        if (!results) return new Set<number>();
        const collected = new Set<number>();
        results.forEach(dayResult => {
            dayResult.matches.forEach(match => {
                // Collect all numbers from the historical array itself
                match.array.forEach(num => collected.add(num));
            });
        });
        return collected;
    }, [results]);

    // Helper function to fetch data and populate inputs
    const fetchAndPopulateInputs = async (tableName: string) => {
        if (!baseDate) {
            toast.error("Please select a date first.");
            return;
        }
        
        setIsLoading(true);
        setResults(null);
        setHighlightedInputs({});
        
        const dateString = format(baseDate, 'yyyy-MM-dd');

        try {
            const { data: records, error } = await supabase
                .from(tableName)
                .select('first_am_day, second_am_day, third_am_day, first_pm_moon, second_pm_moon, third_pm_moon')
                .lte('complete_date', dateString)
                .order('complete_date', { ascending: false })
                .limit(3);

            if (error) {
                toast.error(`Failed to load data for ${tableName}: ${error.message}`);
                return;
            }

            if (!records || records.length === 0) {
                toast.info(`No recent data found for ${tableName} on or before ${dateString}.`);
                setInputs(Array(18).fill(""));
                return;
            }
            
            const paddedRecords: MinimalRecord[] = records.slice(0, 3) as MinimalRecord[];
            while (paddedRecords.length < 3) {
                paddedRecords.push({
                    first_am_day: null, second_am_day: null, third_am_day: null,
                    first_pm_moon: null, second_pm_moon: null, third_pm_moon: null,
                });
            }

            const newInputs: string[] = [];
            
            paddedRecords.forEach(record => {
                const fields = [
                    record.first_am_day, record.second_am_day, record.third_am_day,
                    record.first_pm_moon, record.second_pm_moon, record.third_pm_moon,
                ];
                
                fields.forEach(field => {
                    newInputs.push(field !== null && field !== undefined ? String(field).padStart(2, '0') : "");
                });
            });
            
            setInputs(newInputs);
            toast.success(`Loaded last ${records.length} record(s) on or before ${dateString} from ${tableName}.`);

        } catch (e) {
            console.error("Error fetching data:", e);
            toast.error("An unexpected error occurred while fetching data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (index: number, value: string) => {
        const numericValue = value.replace(/\D/g, "").slice(0, 2);
        const newInputs = [...inputs];
        newInputs[index] = numericValue;
        setInputs(newInputs);
        
        setHighlightedInputs(prev => {
            const newState = { ...prev };
            newState[index] = null; // Clear highlight for this input when it changes
            return newState;
        });
    };

    const handleClearAll = () => {
        setInputs(Array(18).fill(""));
        setResults(null);
        setHighlightedInputs({});
    };

    // New generic search function for Side 2
    const handleSearchMatches = () => {
        setIsLoading(true);
        setResults(null);
        setHighlightedInputs({}); // Clear all highlights at the start of a new search

        // Collect values and convert "00"-"09" to 0-9
        const inputValuesWithIndices: { value: number, index: number }[] = inputs
            .map((val, index) => {
                let trimmedVal = val.trim();
                if (trimmedVal === "") return null;
                let parsedVal = parseInt(trimmedVal);
                // Handle "00"-"09" to 0-9 conversion as per user's JS
                if (trimmedVal.startsWith("0") && trimmedVal.length === 2) {
                    parsedVal = parseInt(trimmedVal[1]);
                }
                return { value: parsedVal, index };
            })
            .filter((item): item is { value: number, index: number } => item !== null && !isNaN(item.value));

        const inputNumbersOnly = inputValuesWithIndices.map(item => item.value);

        if (inputNumbersOnly.length === 0) {
            toast.info("Please enter at least one valid number (0-99).");
            setIsLoading(false);
            return;
        }

        // Count how many times each number appears in the user's inputs
        const counts: Record<number, number> = {};
        inputNumbersOnly.forEach(num => counts[num] = (counts[num] || 0) + 1);

        const foundMatchesDetails: MatchDetail[] = [];
        const newHighlights: Record<number, string | null> = {};

        for (const arr of SIDE2_MATCH_DATA) { // Use SIDE2_MATCH_DATA here
            const matchesInArray = arr.filter(num => inputNumbersOnly.includes(num));

            // Check for repeated input numbers that match
            const hasRepeatedInputMatch = matchesInArray.some(num => counts[num] >= 2);

            // Matching criteria: If at least two different matches OR one match that appears twice or more among inputs
            if (matchesInArray.length >= 2 || hasRepeatedInputMatch) {
                const uniqueFoundNumbers = Array.from(new Set(matchesInArray)); // Ensure unique numbers for display
                
                foundMatchesDetails.push({
                    array: arr,
                    foundNumbers: uniqueFoundNumbers.sort((a, b) => a - b),
                    location: "Side 2 Data", // Generic location for Side 2
                    matchCount: uniqueFoundNumbers.length,
                    totalInArray: arr.length,
                    percentage: Math.round((uniqueFoundNumbers.length / arr.length) * 100),
                });

                // Highlight inputs that contributed to this match
                inputValuesWithIndices.forEach(inputItem => {
                    if (matchesInArray.includes(inputItem.value)) {
                        newHighlights[inputItem.index] = 'verifier'; // Use 'verifier' key for highlighting
                    }
                });
            }
        }

        const verifierDayMatchResult: DayMatchResult = {
            day: 'verifier',
            name: 'Verifier Matches',
            indicatorColor: DAY_COLOR_MAP.verifier.indicatorColor,
            matches: foundMatchesDetails.sort((a, b) => b.matchCount - a.matchCount), // Sort by match count
            totalArraysFound: foundMatchesDetails.length,
            totalNumbersMatched: foundMatchesDetails.reduce((sum, match) => sum + match.matchCount, 0),
        };

        setTimeout(() => {
            setHighlightedInputs(newHighlights);
            setResults(foundMatchesDetails.length > 0 ? [verifierDayMatchResult] : null);
            setIsLoading(false);
            if (foundMatchesDetails.length > 0) {
                toast.success(`Found ${foundMatchesDetails.length} match(es)!`);
            } else if (inputNumbersOnly.length > 0) {
                toast.info("No matches found for the entered numbers.");
            }
        }, 1000);
    };
    
    const handleTransferToVerifier = () => {
        if (allFoundNumbersInResults.size === 0) {
            toast.info("No numbers found to transfer.");
            return;
        }

        const sortedUniqueNumbers = Array.from(allFoundNumbersInResults).sort((a, b) => a - b);
        const numberString = sortedUniqueNumbers.map(n => String(n).padStart(2, '0')).join(',');

        router.push(`/verifier?setA=${numberString}`);
        toast.success(`Transferred ${allFoundNumbersInResults.size} number(s) to Verifier Set A (Green).`);
    };

    // The totalSummary is now derived directly from the 'results' array
    const totalSummary = useMemo(() => {
        if (!results || results.length === 0) return null;
        
        const totalArraysFound = results.reduce((sum, r) => sum + r.totalArraysFound, 0);
        const totalNumbersMatched = results.reduce((sum, r) => sum + r.totalNumbersMatched, 0);

        // For Side 2, we don't have a fixed day1/day2, so we can just list all days found
        // Or, if we want to keep the structure, we can pick the first two days from results
        const day1Summary = results[0] || { name: '', totalArraysFound: 0, totalNumbersMatched: 0 };
        const day2Summary = results[1] || { name: '', totalArraysFound: 0, totalNumbersMatched: 0 }; // This will likely be empty or a placeholder

        return { totalArraysFound, totalNumbersMatched, day1: day1Summary, day2: day2Summary };
    }, [results]);

    return (
        <Card className="w-full shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Side 2 Analysis</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
                
                <DateInputSection date={baseDate} setDate={setBaseDate} />

                <LocationLoadButtons
                    isLoading={isLoading}
                    baseDate={baseDate}
                    fetchAndPopulateInputs={fetchAndPopulateInputs}
                />

                <DayCheckerInputGrid
                    inputs={inputs}
                    handleInputChange={handleInputChange}
                    highlightedInputs={highlightedInputs}
                />

                <div className="space-y-6">
                    <DayCheckerSide2ActionButtons
                        isLoading={isLoading}
                        handleSearchMatches={handleSearchMatches}
                        handleClearAll={handleClearAll}
                    />
                    
                    <DayCheckerResultsDisplay
                        isLoading={isLoading}
                        results={results}
                        totalSummary={totalSummary}
                        allFoundNumbersInResults={allFoundNumbersInResults}
                        handleTransferToVerifier={handleTransferToVerifier}
                    />
                </div>
            </CardContent>
        </Card>
    );
}