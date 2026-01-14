"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

// Define the specific highlight styles based on the provided CSS
const DAY_HIGHLIGHT_STYLES: Record<string, React.CSSProperties> = {
    lundi: { backgroundColor: '#90ee90', borderColor: '#228b22', color: '#006400', fontWeight: 'bold' },
    jeudi: { backgroundColor: '#add8e6', borderColor: '#1e90ff', color: '#00008b', fontWeight: 'bold' },
    mardi: { backgroundColor: '#ffb6c1', borderColor: '#ff69b4', color: '#8b0000', fontWeight: 'bold' },
    vendredi: { backgroundColor: '#ffd700', borderColor: '#ff8c00', color: '#8b4513', fontWeight: 'bold' },
    mercredi: { backgroundColor: '#d8bfd8', borderColor: '#9400d3', color: '#4b0082', fontWeight: 'bold' },
    samedi: { backgroundColor: '#ffa07a', borderColor: '#ff4500', color: '#8b0000', fontWeight: 'bold' },
    dimanche: { backgroundColor: '#f0e68c', borderColor: '#daa520', color: '#8b4513', fontWeight: 'bold' },
};

// Placeholder for the result structure
interface MatchResult {
    day: string;
    matches: {
        numbers: number[];
        location: string;
    }[];
}

export function DayCheckerTool() {
    // State for 24 inputs (3 rows * 2 groups * 4 inputs)
    const [inputs, setInputs] = useState<string[]>(Array(24).fill(""));
    const [results, setResults] = useState<MatchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [highlightDay, setHighlightDay] = useState<string | null>(null);

    const handleInputChange = (index: number, value: string) => {
        // Only allow numbers and limit to 2 digits
        const numericValue = value.replace(/\D/g, "").slice(0, 2);
        const newInputs = [...inputs];
        newInputs[index] = numericValue;
        setInputs(newInputs);
    };

    const handleClearAll = () => {
        setInputs(Array(24).fill(""));
        setResults([]);
        setHighlightDay(null);
    };

    const handleSearchRange = (day1: string, day2: string) => {
        // Placeholder logic for search
        const validInputs = inputs.filter(n => n.length > 0).map(Number);
        
        if (validInputs.length === 0) {
            alert("Please enter at least one number.");
            return;
        }

        setIsLoading(true);
        setResults([]);
        setHighlightDay(day1); // Highlight the first day in the pair

        // Simulate analysis based on the input numbers and the selected day range
        setTimeout(() => {
            // Placeholder results structure
            const mockResults: MatchResult[] = [
                {
                    day: day1,
                    matches: [
                        { numbers: [12, 34], location: "New York" },
                        { numbers: [56], location: "Florida" },
                    ]
                },
                {
                    day: day2,
                    matches: [
                        { numbers: [78, 90, 11], location: "New Jersey" },
                    ]
                }
            ];
            
            setResults(mockResults);
            setIsLoading(false);
        }, 1500);
    };
    
    // Helper to render a group of 4 inputs
    const renderInputGroup = (startIndex: number) => (
        <div className="flex gap-4 flex-wrap justify-center">
            {[0, 1, 2, 3].map(offset => {
                const index = startIndex + offset;
                
                // Apply highlight style if a search button has been clicked
                const style = highlightDay ? DAY_HIGHLIGHT_STYLES[highlightDay] : {};

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
                        style={highlightDay ? style : {}}
                        maxLength={2}
                    />
                );
            })}
        </div>
    );

    // Helper to render a row (MIDI group + SOIR group)
    const renderRow = (rowIndex: number) => {
        const midiStartIndex = rowIndex * 8;
        const soirStartIndex = rowIndex * 8 + 4;
        
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

    return (
        <Card className="w-full shadow-xl">
            <CardHeader className="text-center">
                <CardTitle className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">Day Checker Boulette</CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-8">
                
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
                            Lundi and Jeudi
                        </Button>
                        <Button 
                            onClick={() => handleSearchRange('mardi', 'vendredi')}
                            className={buttonBaseClasses}
                            style={primaryButtonStyles}
                            disabled={isLoading}
                        >
                            Mardi - Vendredi
                        </Button>
                        <Button 
                            onClick={() => handleSearchRange('mercredi', 'samedi')}
                            className={buttonBaseClasses}
                            style={primaryButtonStyles}
                            disabled={isLoading}
                        >
                            Mercredi and Samedi
                        </Button>
                        <Button 
                            onClick={() => handleSearchRange('dimanche', 'lundi')}
                            className={buttonBaseClasses}
                            style={primaryButtonStyles}
                            disabled={isLoading}
                        >
                            Dimanche and Lundi
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
                    <div className="p-5 min-h-32 border-2 rounded-xl bg-muted/50 border-border shadow-inner">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        ) : results.length > 0 ? (
                            <div className="space-y-4">
                                {results.map((dayResult, index) => (
                                    <div key={index} className="day-section p-4 border-l-4 border-green-500 rounded-lg shadow-sm bg-card dark:bg-gray-900">
                                        <h4 className="day-title font-bold text-lg text-foreground mb-2 capitalize">
                                            <span className="inline-block w-5 h-5 rounded mr-2" style={{ backgroundColor: DAY_HIGHLIGHT_STYLES[dayResult.day.toLowerCase()]?.backgroundColor }}></span>
                                            {dayResult.day} Matches:
                                        </h4>
                                        {dayResult.matches.map((match, matchIndex) => (
                                            <div key={matchIndex} className="match-info p-3 rounded-lg mt-2 border-l-4 border-blue-500 bg-muted/50">
                                                <p className="match-numbers font-bold text-foreground">
                                                    Numbers: {match.numbers.map(n => String(n).padStart(2, '0')).join(', ')}
                                                </p>
                                                <p className="match-location text-sm text-muted-foreground">
                                                    Location: {match.location}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ))}
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