"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DateInputSection } from './date-input-section';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Placeholder data structure based on the HTML/CSS provided
const PLACEHOLDER_RESULTS = [
    { day: 'Lundi', numbers: [12, 34, 56, 78] },
    { day: 'Mardi', numbers: [90, 11, 22] },
    { day: 'Mercredi', numbers: [33, 44, 55, 66, 77] },
    { day: 'Jeudi', numbers: [88, 99] },
    { day: 'Vendredi', numbers: [10, 20, 30, 40] },
    { day: 'Samedi', numbers: [50, 60] },
    { day: 'Dimanche', numbers: [70, 80, 90] },
];

export function DayCheckerTool() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [inputNumber, setInputNumber] = useState('');
    const [results, setResults] = useState<typeof PLACEHOLDER_RESULTS | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckDay = () => {
        if (!date || inputNumber.length === 0) {
            // Basic validation
            return;
        }
        
        setIsLoading(true);
        setResults(null);

        // Simulate API call/processing
        setTimeout(() => {
            setResults(PLACEHOLDER_RESULTS);
            setIsLoading(false);
        }, 1000);
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Only allow numbers and limit to 2 digits
        const value = e.target.value.replace(/\D/g, "").slice(0, 2);
        setInputNumber(value);
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">Day Checker</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
                {/* Input Section */}
                <div className="flex flex-col md:flex-row md:items-end gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                    
                    {/* Date Input */}
                    <div className="flex-1">
                        <DateInputSection date={date} setDate={setDate} />
                    </div>

                    {/* Number Input */}
                    <div className="flex-1 space-y-2">
                        <label htmlFor="number" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Enter 2-Digit Number
                        </label>
                        <Input
                            id="number"
                            type="text"
                            inputMode="numeric"
                            placeholder="00"
                            value={inputNumber}
                            onChange={handleNumberChange}
                            className="text-center text-xl font-bold h-10"
                            maxLength={2}
                        />
                    </div>

                    {/* Check Button */}
                    <Button 
                        onClick={handleCheckDay} 
                        className="h-10 md:w-auto w-full"
                        disabled={isLoading || !date || inputNumber.length === 0}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            "Check Day"
                        )}
                    </Button>
                </div>

                {/* Results Section */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <p className="text-lg font-medium text-muted-foreground">Checking historical data...</p>
                    </div>
                )}

                {results && (
                    <div className="results-section grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
                        {results.map((dayResult) => (
                            <Card key={dayResult.day} className="day-card p-4 shadow-md">
                                <CardHeader className="p-0 pb-2 border-b mb-3">
                                    <CardTitle className="day-title text-lg font-bold text-primary">
                                        {dayResult.day}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="number-list flex flex-wrap gap-2">
                                        {dayResult.numbers.map((num, index) => (
                                            <span 
                                                key={index} 
                                                className="number-item px-3 py-1 rounded-full bg-secondary text-secondary-foreground font-mono text-sm font-semibold"
                                            >
                                                {String(num).padStart(2, '0')}
                                            </span>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
                
                {!isLoading && !results && (
                    <div className="text-center py-8 text-muted-foreground">
                        Enter a date and a 2-digit number to begin the analysis.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}