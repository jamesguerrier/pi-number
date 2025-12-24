"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GeneratedNumber {
    original: string;
    type: 'ABC' | 'ACB';
    numbers: string[];
}

// Helper functions for custom Loto-3 logic

/**
 * Ensures result is between 0 and 9, handling wrap-around (e.g., -1 -> 9, 10 -> 0).
 */
function wrap(n: number): number {
    return (n % 10 + 10) % 10;
}

/**
 * Builds the range of leading digits: [d-1, d, d+1] using wrap-around.
 */
function buildRange(digit: number): number[] {
    return [
        wrap(digit - 1),
        wrap(digit),
        wrap(digit + 1)
    ];
}

function parseInput(value: string): string[] {
    return value
        .split(",")
        .map(n => n.trim())
        .filter(n => /^\d{2}$/.test(n)); // Filter for exactly 2 digits
}

export function Loto3Generator() {
    const [input, setInput] = useState('');
    const [results, setResults] = useState<GeneratedNumber[]>([]);

    const generateLoto3 = () => {
        const numbers = parseInput(input);
        const generatedResults: GeneratedNumber[] = [];

        numbers.forEach(num => {
            const a = Number(num[0]);
            const b = Number(num[1]);

            // 1. Get the ranges for A and B
            const rangeA = buildRange(a);
            const rangeB = buildRange(b);

            // 2. Combine ranges and get unique digits
            let leadingDigits = [...new Set([...rangeA, ...rangeB])];
            
            // Sort for consistent output
            leadingDigits.sort((x, y) => x - y);

            // 3. Generate ABC (XAB) and ACB (XBA) combinations
            const abcNumbers = leadingDigits.map(x => `${x}${a}${b}`);
            const acbNumbers = leadingDigits.map(x => `${x}${b}${a}`);

            generatedResults.push({
                original: num,
                type: 'ABC',
                numbers: abcNumbers,
            });

            generatedResults.push({
                original: num,
                type: 'ACB',
                numbers: acbNumbers,
            });
        });

        setResults(generatedResults);
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Loto-3 Generator (Custom Rules)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Input 2-Digit Numbers (AB)</h3>
                    <Textarea 
                        id="loto3-input" 
                        placeholder="Example: 48, 09, 23 (Comma separated 2-digit numbers)"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        rows={3}
                    />
                </div>

                <Button onClick={generateLoto3} className="w-full">
                    Generate Loto-3 Combinations
                </Button>

                <div className="result pt-4 border-t">
                    <h3 className="text-xl font-bold mb-3">Generated Combinations:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
                        {results.length > 0 ? (
                            results.map((res, index) => (
                                <div key={index} className="bg-card p-3 border rounded-lg shadow-sm">
                                    <h4 className="text-center mb-2 font-bold text-primary text-sm">
                                        {res.original} &rarr; {res.type}
                                    </h4>
                                    <div className="space-y-1">
                                        {res.numbers.map((n, i) => (
                                            <div key={i} className="text-center font-mono text-lg font-semibold bg-muted/50 rounded px-2 py-1">
                                                {n}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-muted-foreground italic col-span-full">Enter numbers and click generate.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}