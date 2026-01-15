"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { numberData } from '@/lib/data';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DateInputSection } from './date-input-section';
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
    buttonBaseClasses,
    primaryButtonStyles,
    clearButtonStyles,
} from '@/lib/dayCheckerTypes';

// Import new sub-components
import { LocationLoadButtons } from './day-checker/location-load-buttons';
import { DayCheckerInputGrid } from './day-checker/day-checker-input-grid';
import { DayCheckerActionButtons } from './day-checker/day-checker-action-buttons';
import { DayCheckerResultsDisplay } from './day-checker/day-checker-results-display';

// --- Component ---

export function DayCheckerTool() {
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

    const handleSearchRange = (day1: string, day2: string) => {
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
        const inputSet = new Set(inputValuesWithIndices.map(i => i.value));

        const allMatches: Record<string, MatchDetail[]> = {
            [day1]: [],
            [day2]: [],
        };

        const searchIndividualNumbers = (dayName: string) => {
            const dayKey = dayName as keyof typeof numberData;

            for (const sectionKey in numberData) {
                const section = numberData[sectionKey as keyof typeof numberData];

                for (const subsectionKey in section) {
                    const subsection = section[subsectionKey as keyof typeof section];

                    if (subsection[dayKey as keyof typeof subsection]) {
                        const dayArray = subsection[dayKey as keyof typeof subsection] as number[];
                        const foundInArray: number[] = [];

                        inputValuesWithIndices.forEach(inputItem => {
                            if (dayArray.includes(inputItem.value)) {
                                foundInArray.push(inputItem.value);
                                newHighlights[inputItem.index] = dayName;
                            }
                        });

                        if (foundInArray.length > 0) {
                            const uniqueFoundNumbers = Array.from(new Set(foundInArray));
                            const matchCount = uniqueFoundNumbers.length;
                            const totalInArray = dayArray.length;
                            const percentage = Math.round((matchCount / totalInArray) * 100);

                            allMatches[dayName].push({
                                array: dayArray,
                                foundNumbers: uniqueFoundNumbers,
                                location: `${sectionKey}.${subsectionKey}`,
                                matchCount,
                                totalInArray,
                                percentage,
                            });
                        }
                    }
                }
            }
            allMatches[dayName].sort((a, b) => b.matchCount - a.matchCount);
        };

        searchIndividualNumbers(day1);
        searchIndividualNumbers(day2);

        const finalResults: DayMatchResult[] = [day1, day2].map(dayKey => {
            const dayInfo = DAY_COLOR_MAP[dayKey as DayKey];
            const matches = allMatches[dayKey];
            
            return {
                day: dayKey,
                name: dayInfo.name,
                indicatorColor: dayInfo.indicatorColor,
                matches: matches,
                totalArraysFound: matches.length,
                totalNumbersMatched: matches.reduce((sum, match) => sum + match.matchCount, 0),
            };
        });

        setTimeout(() => {
            setHighlightedInputs(newHighlights);
            setResults(finalResults);
            setIsLoading(false);
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
        if (!results) return null;
        
        const day1 = results[0];
        const day2 = results[1];
        
        const totalArraysFound = day1.totalArraysFound + day2.totalArraysFound;
        const totalNumbersMatched = day1.totalNumbersMatched + day2.totalNumbersMatched;

        return { totalArraysFound, totalNumbersMatched, day1, day2 };
    }, [results]);

    return (
        <Card className="w-full shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Day Checker Boulette</CardTitle>
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
                    <DayCheckerActionButtons
                        isLoading={isLoading}
                        handleSearchRange={handleSearchRange}
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