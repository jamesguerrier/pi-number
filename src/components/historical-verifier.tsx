"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { performHistoricalVerification } from '@/lib/historicalAnalysis';
import { HistoricalVerificationHit } from '@/lib/schemas';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

// Helper function to parse input
function parseInput(value: string): number[] {
  return value
    .split(',')
    .map(v => v.trim())
    .filter(v => /^\d{1,2}$/.test(v)) // Filter for 1 or 2 digits
    .map(v => parseInt(v.padStart(2, '0'))); // Ensure 2 digits for consistency
}

const LOCATIONS = [
    { name: "New York", table: "new_york_data" },
    { name: "Florida", table: "florida_data" },
    { name: "New Jersey", table: "new_jersey_data" },
    { name: "Georgia", table: "georgia_data" },
];

const DAYS = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];

export function HistoricalVerifier() {
    const [baseDate, setBaseDate] = useState<Date | undefined>(new Date());
    const [inputNumbers, setInputNumbers] = useState('');
    const [selectedDay, setSelectedDay] = useState<string>('Monday');
    const [selectedLocation, setSelectedLocation] = useState<string>('new_york_data');
    const [results, setResults] = useState<HistoricalVerificationHit[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const parsedNumbers = useMemo(() => parseInput(inputNumbers), [inputNumbers]);
    const isSearchDisabled = !baseDate || parsedNumbers.length === 0 || !selectedDay || !selectedLocation;

    const handleSearch = async () => {
        if (isSearchDisabled) {
            toast.error("Please select a date, enter numbers, and select a day/location.");
            return;
        }

        setIsLoading(true);
        setResults([]);
        
        try {
            const hits = await performHistoricalVerification(
                baseDate!,
                selectedLocation,
                selectedDay,
                parsedNumbers
            );
            
            setResults(hits);
            
            if (hits.length > 0) {
                toast.success(`Found ${hits.length} historical match(es)!`);
            } else {
                toast.info("No matches found in the last 7 weeks for the selected criteria.");
            }
        } catch (error) {
            console.error("Historical verification failed:", error);
            toast.error("An error occurred during verification.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Historical Day Verifier (7 Weeks)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                
                {/* Input Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date Picker */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !baseDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {baseDate ? format(baseDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={baseDate}
                                    onSelect={setBaseDate}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Day Selector */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Target Day</label>
                        <Select value={selectedDay} onValueChange={setSelectedDay}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Day" />
                            </SelectTrigger>
                            <SelectContent>
                                {DAYS.map(day => (
                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                
                {/* Database Selector */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Database Location</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Location" />
                        </SelectTrigger>
                        <SelectContent>
                            {LOCATIONS.map(loc => (
                                <SelectItem key={loc.table} value={loc.table}>{loc.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Numbers Input */}
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold">Numbers to Verify (0-99)</h3>
                    <Textarea 
                        id="verifier-numbers" 
                        placeholder="Example: 48, 09, 23 (Comma separated 2-digit numbers)"
                        value={inputNumbers}
                        onChange={(e) => setInputNumbers(e.target.value)}
                        rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                        {parsedNumbers.length} valid numbers entered.
                    </p>
                </div>

                <Button 
                    onClick={handleSearch} 
                    className="w-full gap-2"
                    disabled={isSearchDisabled || isLoading}
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4" />
                    )}
                    Search Last 7 Weeks
                </Button>

                {/* Results Display */}
                <div className="result pt-4 border-t">
                    <h3 className="text-xl font-bold mb-3">Verification Hits:</h3>
                    <ScrollArea className="h-64 border rounded-lg p-4 bg-muted/50">
                        <div className="space-y-3">
                            {results.length > 0 ? (
                                results.map((hit, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-md bg-background shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "font-mono text-xl font-bold",
                                                hit.matchType === 'strict' ? "text-red-600 dark:text-red-400" : "text-blue-600 dark:text-blue-400"
                                            )}>
                                                {String(hit.numberFound).padStart(2, '0')}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                ({hit.matchType === 'strict' ? 'Strict' : 'Reverse'} Match)
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium">{format(parseISO(hit.date), 'MMM dd, yyyy')}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{hit.tableName.replace('_data', '')}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-muted-foreground py-10">
                                    {isLoading ? "Searching..." : "No results yet. Enter criteria and search."}
                                </p>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </CardContent>
        </Card>
    );
}