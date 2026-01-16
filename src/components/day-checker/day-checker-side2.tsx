"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { numberData } from '@/lib/data';
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
            newState[index] = null;
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
        const inputValuesWithIndices: { value: number, index: number }[] = inputs
            .map((val, index) => ({ value: val.trim() === '' ? null : parseInt(val), index }))
            .filter((item): item is { value: number, index: number } => item.value !== null && !isNaN(item.value));

        if (inputValuesWithIndices.length === 0) {
            alert("Please enter at least one valid number (0-99).");
            return;
        }

        setIsLoading(true);
        setResults(null);
        
        const newHighlights: Record<number, string | null> = {};
        const allDayMatches: Record<string, MatchDetail[]> = {}; // Group matches by day

        // Initialize allDayMatches for all possible days
        for (const dayKey in DAY_COLOR_MAP) {
            allDayMatches[dayKey] = [];
        }

        // Iterate through all input numbers
        inputValuesWithIndices.forEach(inputItem => {
            // Iterate through all sections (lunMar, marMer, etc.)
            for (const sectionKey in numberData) {
                const section = numberData[sectionKey as keyof typeof numberData];

                // Iterate through all subsections (firstLM, secondLM, etc.)
                for (const subsectionKey in section) {
                    const subsection = section[subsectionKey as keyof typeof section];

                    // Iterate through all days within the subsection (lundi, mardi, etc.)
                    for (const dayKey in subsection) {
                        const dayArray = subsection[dayKey as keyof typeof subsection] as number[];
                        
                        if (dayArray.includes(inputItem.value)) {
                            // Match found for this input number in this day's array
                            const dayName = dayKey; // French day name
                            newHighlights[inputItem.index] = dayName;

                            const matchDetail: MatchDetail = {
                                array: dayArray,
                                foundNumbers: [inputItem.value], // Only this input number was found
                                location: `${sectionKey}.${subsectionKey}`,
                                matchCount: 1,
                                totalInArray: dayArray.length,
                                percentage: Math.round((1 / dayArray.length) * 100),
                            };
                            allDayMatches[dayName].push(matchDetail);
                        }
                    }
                }
            }
        });

        // Consolidate and format results
        const finalResults: DayMatchResult[] = [];
        for (const dayKey in allDayMatches) {
            const dayInfo = DAY_COLOR_MAP[dayKey as DayKey];
            const matches = allDayMatches[dayKey];

            if (matches.length > 0) {
                // Further consolidate matches for the same day and array to avoid duplicates
                const consolidatedMatchesMap = new Map<string, MatchDetail>(); // Key: array.join('-') + location

                matches.forEach(match => {
                    const key = `${match.array.join('-')}-${match.location}`;
                    if (consolidatedMatchesMap.has(key)) {
                        const existingMatch = consolidatedMatchesMap.get(key)!;
                        if (!existingMatch.foundNumbers.includes(match.foundNumbers[0])) {
                            existingMatch.foundNumbers.push(match.foundNumbers[0]);
                            existingMatch.matchCount++;
                            existingMatch.percentage = Math.round((existingMatch.matchCount / existingMatch.totalInArray) * 100);
                        }
                    } else {
                        consolidatedMatchesMap.set(key, { ...match });
                    }
                });

                const consolidatedMatches = Array.from(consolidatedMatchesMap.values());
                consolidatedMatches.forEach(match => match.foundNumbers.sort((a, b) => a - b)); // Sort found numbers

                finalResults.push({
                    day: dayKey,
                    name: dayInfo.name,
                    indicatorColor: dayInfo.indicatorColor,
                    matches: consolidatedMatches.sort((a, b) => b.matchCount - a.matchCount),
                    totalArraysFound: consolidatedMatches.length,
                    totalNumbersMatched: consolidatedMatches.reduce((sum, match) => sum + match.matchCount, 0),
                });
            }
        }
        
        // Sort final results by day order
        const dayOrder = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];
        finalResults.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));


        setTimeout(() => {
            setHighlightedInputs(newHighlights);
            setResults(finalResults);
            setIsLoading(false);
            if (finalResults.length > 0) {
                toast.success("Matches found!");
            } else {
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

    const totalSummary = useMemo(() => {
        if (!results || results.length === 0) return null;
        
        const totalArraysFound = results.reduce((sum, r) => sum + r.totalArraysFound, 0);
        const totalNumbersMatched = results.reduce((sum, r) => sum + r.totalNumbersMatched, 0);

        // For Side 2, we don't have a fixed day1/day2, so we can just list all days found
        // Or, if we want to keep the structure, we can pick the first two days from results
        const day1Summary = results[0] || { name: '', totalArraysFound: 0, totalNumbersMatched: 0 };
        const day2Summary = results[1] || { name: '', totalArraysFound: 0, totalNumbersMatched: 0 };

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