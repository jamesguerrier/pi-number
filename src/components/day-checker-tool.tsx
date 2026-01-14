"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2, Database } from 'lucide-react';
import { numberData } from '@/lib/data'; // Reusing existing analysis data
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { DatabaseRecord } from '@/lib/schemas';
import { DateInputSection } from './date-input-section'; // Import DateInputSection
import { format } from 'date-fns';

// --- Data Structures and Constants ---

// Day color map for display and styling (using French keys for logic, but English names for display)
const DAY_COLOR_MAP = {
    'lundi': { name: 'Monday', indicatorColor: '#90ee90', style: { backgroundColor: '#90ee90', borderColor: '#228b22', color: '#006400', fontWeight: 'bold' } },
    'jeudi': { name: 'Thursday', indicatorColor: '#add8e6', style: { backgroundColor: '#add8e6', borderColor: '#1e90ff', color: '#00008b', fontWeight: 'bold' } },
    'mardi': { name: 'Tuesday', indicatorColor: '#ffb6c1', style: { backgroundColor: '#ffb6c1', borderColor: '#ff69b4', color: '#8b0000', fontWeight: 'bold' } },
    'vendredi': { name: 'Friday', indicatorColor: '#ffd700', style: { backgroundColor: '#ffd700', borderColor: '#ff8c00', color: '#8b4513', fontWeight: 'bold' } },
    'mercredi': { name: 'Wednesday', indicatorColor: '#d8bfd8', style: { backgroundColor: '#d8bfd8', borderColor: '#9400d3', color: '#4b0082', fontWeight: 'bold' } },
    'samedi': { name: 'Saturday', indicatorColor: '#ffa07a', style: { backgroundColor: '#ffa07a', borderColor: '#ff4500', color: '#8b0000', fontWeight: 'bold' } },
    'dimanche': { name: 'Sunday', indicatorColor: '#f0e68c', style: { backgroundColor: '#f0e68c', borderColor: '#daa520', color: '#8b4513', fontWeight: 'bold' } },
};

type DayKey = keyof typeof DAY_COLOR_MAP;

interface MatchDetail {
    array: number[];
    foundNumbers: number[];
    location: string;
    matchCount: number;
    totalInArray: number;
    percentage: number;
}

interface DayMatchResult {
    day: string; // French day name key
    name: string; // English day name
    indicatorColor: string;
    matches: MatchDetail[];
    totalArraysFound: number;
    totalNumbersMatched: number;
}

const LOCATION_MAP = [
    { name: "New York", tableName: "new_york_data" },
    { name: "Florida", tableName: "florida_data" },
    { name: "New Jersey", tableName: "new_jersey_data" },
];

// Define a minimal type for the selected fields, explicitly allowing null
type MinimalRecord = {
    first_am_day: number | null;
    second_am_day: number | null;
    third_am_day: number | null;
    first_pm_moon: number | null;
    second_pm_moon: number | null;
    third_pm_moon: number | null;
};

// --- Component ---

export function DayCheckerTool() {
    // State for 18 inputs (3 rows * 2 groups * 3 inputs)
    const [inputs, setInputs] = useState<string[]>(Array(18).fill(""));
    const [results, setResults] = useState<DayMatchResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [baseDate, setBaseDate] = useState<Date | undefined>(new Date()); // New state for date picker
    // State to track which input index should be highlighted and with which day's style
    const [highlightedInputs, setHighlightedInputs] = useState<Record<number, string | null>>({});

    // Helper function to fetch data and populate inputs
    const fetchAndPopulateInputs = async (tableName: string) => {
        if (!baseDate) {
            toast.error("Please select a date first.");
            return;
        }
        
        setIsLoading(true);
        setResults(null);
        setHighlightedInputs({});
        
        // Format the base date to 'yyyy-MM-dd' for Supabase filtering
        const dateString = format(baseDate, 'yyyy-MM-dd');

        try {
            // Fetch the last 3 records, ordered by complete_date, up to and including the selected date
            const { data: records, error } = await supabase
                .from(tableName)
                .select('first_am_day, second_am_day, third_am_day, first_pm_moon, second_pm_moon, third_pm_moon')
                .lte('complete_date', dateString) // Filter: Less than or equal to the selected date
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
            
            // Map the 3 records to the 18 inputs (6 fields per record * 3 records)
            // Record 1 (Most Recent) -> Inputs 0-5 (Row 0)
            // Record 2 -> Inputs 6-11 (Row 1)
            // Record 3 (Least Recent) -> Inputs 12-17 (Row 2)
            paddedRecords.forEach(record => {
                const fields = [
                    record.first_am_day, record.second_am_day, record.third_am_day,
                    record.first_pm_moon, record.second_pm_moon, record.third_pm_moon,
                ];
                
                fields.forEach(field => {
                    // Convert number to 2-digit string, or empty string if null/undefined
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
        // Only allow numbers and limit to 2 digits
        const numericValue = value.replace(/\D/g, "").slice(0, 2);
        const newInputs = [...inputs];
        newInputs[index] = numericValue;
        setInputs(newInputs);
        
        // Clear highlight for this specific input when value changes
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
        
        // Reset highlights before search
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

                        // Check each input value against the dayArray
                        inputValuesWithIndices.forEach(inputItem => {
                            if (dayArray.includes(inputItem.value)) {
                                foundInArray.push(inputItem.value);
                                // Highlight all inputs that match this day's array
                                newHighlights[inputItem.index] = dayName;
                            }
                        });

                        // Store match details
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
            // Sort matches by match count descending
            allMatches[dayName].sort((a, b) => b.matchCount - a.matchCount);
        };

        searchIndividualNumbers(day1);
        searchIndividualNumbers(day2);

        // Format results for state
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

        // Update state after a short delay to show loading
        setTimeout(() => {
            setHighlightedInputs(newHighlights);
            setResults(finalResults);
            setIsLoading(false);
        }, 1000);
    };
    
    // Helper to render a group of 3 inputs (MIDI or SOIR)
    const renderInputGroup = (startIndex: number) => (
        <div className="flex gap-4 flex-wrap justify-center">
            {[0, 1, 2].map(offset => {
                const index = startIndex + offset;
                
                const dayKey = highlightedInputs[index];
                const style = dayKey ? DAY_COLOR_MAP[dayKey as DayKey].style : {};

                return (
                    <Input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        placeholder="00"
                        value={inputs[index]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        className={cn(
                            // Custom circular input styling
                            "w-[80px] h-[80px] text-2xl text-center border-2 rounded-full font-bold shadow-md transition-all duration-300",
                            "focus:border-blue-500 focus:shadow-lg focus:scale-105",
                            "bg-input border-border text-foreground" // Default Shadcn/Tailwind classes
                        )}
                        style={style}
                        maxLength={2}
                    />
                );
            })}
        </div>
    );

    // Helper to render a row (MIDI group + SOIR group)
    const renderRow = (rowIndex: number) => {
        const inputsPerRow = 6; // 3 MIDI + 3 SOIR
        const midiStartIndex = rowIndex * inputsPerRow;
        const soirStartIndex = rowIndex * inputsPerRow + 3; // Start SOIR after 3 MIDI inputs
        
        return (
            <div className="flex flex-col md:flex-row justify-center gap-5 md:gap-10 mb-4">
                {/* MIDI Group */}
                {renderInputGroup(midiStartIndex)}
                {/* SOIR Group */}
                {renderInputGroup(soirStartIndex)}
            </div>
        );
    };
    
    // Custom button styles based on provided CSS gradients
    const buttonBaseClasses = "px-4 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:translate-y-[-3px]";
    const primaryButtonStyles = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
    };
    const clearButtonStyles = {
        background: 'linear-gradient(135deg, #f56565 0%, #ed64a6 100%)',
        boxShadow: '0 4px 15px rgba(245, 101, 101, 0.3)',
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
                
                {/* Date Input Section */}
                <DateInputSection date={baseDate} setDate={setBaseDate} />

                {/* Location Load Buttons */}
                <div className="flex flex-wrap gap-3 justify-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    {LOCATION_MAP.map((location) => (
                        <Button
                            key={location.tableName}
                            onClick={() => fetchAndPopulateInputs(location.tableName)}
                            disabled={isLoading || !baseDate}
                            variant="outline"
                            className="gap-2"
                        >
                            <Database className="h-4 w-4" />
                            Load {location.name} Data
                        </Button>
                    ))}
                </div>

                {/* Header Groups */}
                <div className="flex justify-around p-3 rounded-xl bg-muted dark:bg-gray-800 shadow-inner">
                    <h2 className="text-xl font-bold text-foreground">MIDI</h2>
                    <h2 className="text-xl font-bold text-foreground">SOIR</h2>
                </div>

                {/* Input Grid */}
                <div className="space-y-4">
                    {renderRow(0)}
                    {renderRow(1)}
                    {renderRow(2)}
                </div>

                {/* Button Group */}
                <div className="space-y-6">
                    <div className="flex flex-wrap gap-3 justify-center">
                        <Button 
                            onClick={() => handleSearchRange('lundi', 'jeudi')}
                            className={buttonBaseClasses}
                            style={primaryButtonStyles}
                            disabled={isLoading}
                        >
                            Monday and Thursday
                        </Button>
                        <Button 
                            onClick={() => handleSearchRange('mardi', 'vendredi')}
                            className={buttonBaseClasses}
                            style={primaryButtonStyles}
                            disabled={isLoading}
                        >
                            Tuesday - Friday
                        </Button>
                        <Button 
                            onClick={() => handleSearchRange('mercredi', 'samedi')}
                            className={buttonBaseClasses}
                            style={primaryButtonStyles}
                            disabled={isLoading}
                        >
                            Wednesday and Saturday
                        </Button>
                        <Button 
                            onClick={() => handleSearchRange('dimanche', 'lundi')}
                            className={buttonBaseClasses}
                            style={primaryButtonStyles}
                            disabled={isLoading}
                        >
                            Sunday and Monday
                        </Button>
                        <Button 
                            onClick={handleClearAll}
                            className={cn(buttonBaseClasses, "clear-btn")}
                            style={clearButtonStyles}
                            disabled={isLoading}
                        >
                            Clear All
                        </Button>
                    </div>
                    
                    {/* Result Area */}
                    <div id="result" className="p-5 min-h-32 border-2 rounded-xl bg-muted/50 border-border shadow-inner">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : results && totalSummary ? (
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
                                                    <div className="match-numbers">Found {match.matchCount}/{match.totalInArray} numbers: [{match.foundNumbers.map(n => String(n).padStart(2, '0')).join(', ')}]</div>
                                                    <div className="match-location text-sm text-muted-foreground">Location: {match.location}</div>
                                                    <div className="match-location text-sm text-muted-foreground">Match: {match.percentage}% ({match.matchCount} of {match.totalInArray})</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-match text-muted-foreground italic">No matches found for {dayResult.name}</div>
                                        )}
                                    </div>
                                ))}
                                
                                {/* Summary */}
                                <div className="match-info p-3 rounded-lg mt-4 border-l-4 border-purple-500 bg-muted/50">
                                    <div className="match-numbers font-bold text-foreground">Summary:</div>
                                    <div className="match-location text-sm text-muted-foreground">Total arrays with matches: {totalSummary.totalArraysFound}</div>
                                    <div className="match-location text-sm text-muted-foreground">Total numbers matched: {totalSummary.totalNumbersMatched}</div>
                                    <div className="match-location text-sm text-muted-foreground">{totalSummary.day1.name}: {totalSummary.day1.totalArraysFound} arrays ({totalSummary.day1.totalNumbersMatched} numbers)</div>
                                    <div className="match-location text-sm text-muted-foreground">{totalSummary.day2.name}: {totalSummary.day2.totalArraysFound} arrays ({totalSummary.day2.totalNumbersMatched} numbers)</div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-muted-foreground italic">Click a button to search for matches.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}