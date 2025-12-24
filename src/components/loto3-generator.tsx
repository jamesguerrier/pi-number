"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VERIFIER_DATA } from '@/lib/verifierData';
import { reverseNumber } from '@/lib/utils';
import { Input } from '@/components/ui/input';

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

/**
 * Generates the 6/9 complement of a 2-digit number by swapping all 6s and 9s.
 */
function swapSixNine(n: number): number {
    if (n < 0 || n > 99) return n;
    let s = String(n).padStart(2, '0');
    // Use a temporary character 'X' to handle simultaneous replacement
    s = s.replace(/6/g, 'X').replace(/9/g, '6').replace(/X/g, '9');
    return parseInt(s);
}

function parseInput(value: string): string[] {
    return value
        .split(",")
        .map(n => n.trim())
        .filter(n => /^\d{2}$/.test(n)); // Filter for exactly 2 digits
}

interface Loto3GeneratorProps {
    inputOverride: string;
}

export function Loto3Generator({ inputOverride }: Loto3GeneratorProps) {
    const [input, setInput] = useState(inputOverride);
    const [results, setResults] = useState<GeneratedNumber[]>([]);
    
    // New state for Paired Numbers feature
    const [pairedInput, setPairedInput] = useState('');
    const [pairedResults, setPairedResults] = useState<string>('');

    // Sync internal state with external override
    useEffect(() => {
        if (inputOverride !== input) {
            setInput(inputOverride);
        }
    }, [inputOverride, input]);

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
    
    // New function for Paired Numbers check
    const checkPairedNumbers = () => {
        const rawInput = pairedInput.trim();
        const inputNum = Number(rawInput);
        
        if (rawInput.length === 0 || isNaN(inputNum) || inputNum < 0 || inputNum > 99) {
            setPairedResults('Please enter a valid 2-digit number (0-99).');
            return;
        }

        const targetNumbers = new Set<number>();
        targetNumbers.add(inputNum);
        
        // Add the reverse number if it's different
        const reversedNum = reverseNumber(inputNum);
        if (reversedNum !== inputNum) {
            targetNumbers.add(reversedNum);
        }

        const collectedNumbers = new Set<number>();

        VERIFIER_DATA.forEach(row => {
            let foundMatch = false;
            
            // Check if any target number is in the current row
            for (const target of targetNumbers) {
                if (row.includes(target)) {
                    foundMatch = true;
                    break;
                }
            }

            if (foundMatch) {
                // If a match is found, add all numbers from that row to the collection
                row.forEach(num => collectedNumbers.add(num));
            }
        });
        
        // --- NEW LOGIC: Apply 6/9 swap rule ---
        const numbersToSwap = Array.from(collectedNumbers);
        numbersToSwap.forEach(num => {
            const swappedNum = swapSixNine(num);
            collectedNumbers.add(swappedNum);
        });
        // ---------------------------------------

        // Format the unique collected numbers
        const resultString = Array.from(collectedNumbers)
            .sort((a, b) => a - b)
            .map(n => String(n).padStart(2, '0'))
            .join(', ');
        
        setPairedResults(resultString || 'No paired numbers found in VERIFIER_DATA.');
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
                
                {/* NEW: Paired Numbers Section */}
                <div className="pt-6 border-t space-y-4">
                    <h3 className="text-lg font-semibold">Paired Numbers</h3>
                    <div className="flex gap-2">
                        <Input
                            id="paired-input" 
                            placeholder="e.g., 99 or 69"
                            value={pairedInput}
                            onChange={(e) => setPairedInput(e.target.value.replace(/\D/g, "").slice(0, 2))}
                            className="w-24 text-center font-mono text-lg"
                            maxLength={2}
                        />
                        <Button onClick={checkPairedNumbers} className="flex-grow">
                            Check Paired
                        </Button>
                    </div>
                    
                    <div className="result pt-2">
                        <h4 className="font-semibold mb-1">Paired Results:</h4>
                        <div className="p-3 bg-muted/50 rounded-md break-all font-mono text-sm text-foreground">
                            {pairedResults || 'Awaiting input...'}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}