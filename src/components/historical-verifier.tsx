"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { performHistoricalVerification, VerificationHit } from '@/lib/historicalVerifier';
import { Loader2, Calendar, MapPin, Info } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper function to parse input (copied from VerifierTool)
function parseInput(value: string): number[] {
  return value
    .split(',')
    .map(v => v.trim()) // Keep as string and trim whitespace
    .filter(v => /^\d{1,2}$/.test(v) && Number(v) >= 0 && Number(v) <= 99) // Filter valid 1 or 2 digit number strings
    .map(v => Number(v)); // Convert valid strings to numbers
}

const DAYS_OF_WEEK = [
    { name: "Sunday", index: 0 },
    { name: "Monday", index: 1 },
    { name: "Tuesday", index: 2 },
    { name: "Wednesday", index: 3 },
    { name: "Thursday", index: 4 },
    { name: "Friday", index: 5 },
    { name: "Saturday", index: 6 },
];

const LOCATIONS = [
    { name: "New York", tableName: "new_york_data" },
    { name: "Florida", tableName: "florida_data" },
    { name: "New Jersey", tableName: "new_jersey_data" },
    { name: "Georgia", tableName: "georgia_data" },
];

export function HistoricalVerifier() {
    const [inputNumbers, setInputNumbers] = useState('');
    const [selectedDayIndex, setSelectedDayIndex] = useState<number | undefined>(undefined);
    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const [results, setResults] = useState<VerificationHit[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleVerify = async () => {
        const numbers = parseInput(inputNumbers);
        
        if (numbers.length === 0) {
            toast.error("Please enter at least one 2-digit number (0-99).");
            return;
        }
        
        if (selectedDayIndex === undefined) {
            toast.error("Please select a day of the week.");
            return;
        }
        
        if (selectedLocation === undefined) {
            toast.error("Please select a location.");
            return;
        }

        setIsLoading(true);
        setResults([]);
        
        try {
            // Use today's date as the base date for calculation
            const baseDate = new Date();
            // Pass selectedLocation to the verification function
            const hits = await performHistoricalVerification(baseDate, selectedDayIndex, numbers, selectedLocation);
            
            setResults(hits);
            
            const locationName = LOCATIONS.find(l => l.tableName === selectedLocation)?.name || selectedLocation;

            if (hits.length > 0) {
                toast.success(`Found ${hits.length} historical match(es) in ${locationName}!`);
            } else {
                toast.info(`No matches found in the last 7 weeks for the selected day in ${locationName}.`);
            }
        } catch (error) {
            console.error("Verification failed:", error);
            toast.error("An error occurred during verification.");
        } finally {
            setIsLoading(false);
        }
    };

    const selectedDayName = DAYS_OF_WEEK.find(d => d.index === selectedDayIndex)?.name;
    const selectedLocationName = LOCATIONS.find(l => l.tableName === selectedLocation)?.name;

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Historical Day Verifier (7 Weeks)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Numbers to Check (0-99)</h3>
                    <Textarea 
                        id="verifier-numbers" 
                        placeholder="Example: 34, 56, 33 (Comma separated numbers)"
                        value={inputNumbers}
                        onChange={(e) => setInputNumbers(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location Select */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Select Location</h3>
                        <Select 
                            onValueChange={setSelectedLocation}
                            value={selectedLocation}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a location" />
                            </SelectTrigger>
                            <SelectContent>
                                {LOCATIONS.map(location => (
                                    <SelectItem key={location.tableName} value={location.tableName}>
                                        {location.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    
                    {/* Day Select */}
                    <div className="space-y-2">
                        <h3 className="text-lg font-semibold">Select Day of the Week</h3>
                        <Select 
                            onValueChange={(value) => setSelectedDayIndex(Number(value))}
                            value={selectedDayIndex !== undefined ? String(selectedDayIndex) : undefined}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a day" />
                            </SelectTrigger>
                            <SelectContent>
                                {DAYS_OF_WEEK.map(day => (
                                    <SelectItem key={day.index} value={String(day.index)}>
                                        {day.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <Button 
                    onClick={handleVerify} 
                    className="w-full"
                    disabled={isLoading || inputNumbers.trim() === '' || selectedDayIndex === undefined || selectedLocation === undefined}
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        "Check Historical Matches"
                    )}
                </Button>

                <div className="result pt-4 border-t">
                    <h3 className="text-xl font-bold mb-3">
                        {selectedLocationName && selectedDayName ? `Results for ${selectedLocationName} on ${selectedDayName}` : "Results"}
                    </h3>
                    
                    {isLoading && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}

                    {!isLoading && results.length > 0 && (
                        <ScrollArea className="h-64 pr-4">
                            <div className="space-y-3">
                                {results.map((hit, index) => (
                                    <div key={index} className="p-3 border rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-gray-800">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "px-3 py-1 rounded-full font-mono text-xl font-bold",
                                                hit.matchType === 'strict' 
                                                    ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                                    : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                            )}>
                                                {String(hit.numberFound).padStart(2, '0')}
                                            </span>
                                            <span className="text-sm text-muted-foreground capitalize">
                                                ({hit.matchType} match)
                                            </span>
                                        </div>
                                        <div className="text-sm space-y-1 md:space-y-0 md:text-right pt-2 md:pt-0">
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <MapPin className="h-4 w-4" />
                                                <span className="capitalize">{hit.location.replace(/_/g, ' ').replace(/ data/g, '')}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <Calendar className="h-4 w-4" />
                                                <span>{format(parseISO(hit.date), 'EEEE, MMM dd, yyyy')}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                    
                    {!isLoading && results.length === 0 && inputNumbers.trim() !== '' && selectedDayIndex !== undefined && selectedLocation !== undefined && (
                        <p className="text-muted-foreground italic text-center py-4">No historical matches found.</p>
                    )}
                    
                    {!isLoading && (inputNumbers.trim() === '' || selectedDayIndex === undefined || selectedLocation === undefined) && (
                        <p className="text-muted-foreground italic text-center py-4">Please enter numbers, select a location, and select a day to begin verification.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}