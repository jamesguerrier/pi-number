"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VERIFIER_DATA } from '@/lib/verifierData';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Info } from 'lucide-react';
import { toast } from 'sonner';

interface MatchResult {
    matchA: number;
    matchB: number;
}

/**
 * Parses a comma-separated string of numbers into an array of integers.
 */
function parseInput(value: string): number[] {
  return value
    .split(',')
    .map(v => Number(v.trim()))
    .filter(v => !isNaN(v) && v >= 0 && v <= 99); // Filter for valid 2-digit numbers
}

interface VerifierToolProps {
    onMatchFound: (numbers: string) => void;
    inputA: string; // Controlled state for Input A
    setInputA: (value: string) => void; // Setter for Input A
}

export function VerifierTool({ onMatchFound, inputA, setInputA }: VerifierToolProps) {
  const searchParams = useSearchParams();
  // inputB remains local state
  const [inputB, setInputB] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [autoChecked, setAutoChecked] = useState(false);

  useEffect(() => {
    const setAFromUrl = searchParams.get('setA');
    if (setAFromUrl) {
      // Pre-populate inputA with the numbers passed from the analysis page
      setInputA(setAFromUrl);
    }
  }, [searchParams, setInputA]);

  // Function to perform the matching logic
  const matchNumbers = useCallback(() => {
    const A = parseInput(inputA);
    const B = parseInput(inputB);
    const foundMatches: MatchResult[] = [];
    // Use a Set to track unique pairs (matchA, matchB) to prevent duplicates across different rows
    const uniquePairs = new Set<string>(); 
    const uniqueMatchA = new Set<number>(); // Track unique matchA numbers

    VERIFIER_DATA.forEach(row => {
      // Find all numbers in the row that are present in Set A
      const matchesA = row.filter(n => A.includes(n));
      // Find all numbers in the row that are present in Set B
      const matchesB = row.filter(n => B.includes(n));

      if (matchesA.length > 0 && matchesB.length > 0) {
        // Generate all unique combinations (Cartesian product)
        matchesA.forEach(matchA => {
          matchesB.forEach(matchB => {
            const pairKey = `${matchA}-${matchB}`;
            
            if (!uniquePairs.has(pairKey)) {
                uniquePairs.add(pairKey);
                foundMatches.push({ matchA, matchB });
                uniqueMatchA.add(matchA); // Collect unique matchA numbers
            }
          });
        });
      }
    });

    setResults(foundMatches);
    
    // Automatically transfer unique MatchA numbers (green) to Loto-3 input
    const sortedUniqueMatchA = Array.from(uniqueMatchA).sort((a, b) => a - b);
    const numberString = sortedUniqueMatchA.map(n => String(n).padStart(2, '0')).join(',');
    
    if (numberString) {
        onMatchFound(numberString);
    }
    
    // Show notification if matches were found
    if (foundMatches.length > 0) {
      toast.success(`Found ${foundMatches.length} match(es)!`);
    } else if (A.length > 0 && B.length > 0) {
      toast.info("No matches found between the two sets.");
    }
  }, [inputA, inputB, onMatchFound]);

  // Automatically check matches when inputA changes (including when Paired Results are transferred)
  useEffect(() => {
    if (inputA.trim() && inputB.trim()) {
      matchNumbers();
      setAutoChecked(true);
    }
  }, [inputA, inputB, matchNumbers]);

  const handleManualCheck = () => {
    setAutoChecked(false);
    matchNumbers();
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Number Match Verifier</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Input Set A (Green)</h3>
          <Textarea 
            id="inputA" 
            placeholder="Example: 34, 56, 33 (Comma separated numbers)"
            value={inputA}
            onChange={(e) => setInputA(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Input Set B (Red)</h3>
          <Textarea 
            id="inputB" 
            placeholder="Example: 96, 03, 22 (Comma separated numbers)"
            value={inputB}
            onChange={(e) => setInputB(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Info className="h-4 w-4" />
          <span>Matches are checked automatically when both sets have numbers.</span>
        </div>

        <Button onClick={handleManualCheck} className="w-full">
          Check Matches
        </Button>

        {autoChecked && (
          <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span>Matches were automatically checked when numbers were added.</span>
          </div>
        )}

        <div className="result pt-4 border-t">
          <h3 className="text-xl font-bold mb-3">Results:</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.length > 0 ? (
              results.map((match, index) => {
                const isDifferent = match.matchA !== match.matchB;
                return (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-md bg-gray-50 dark:bg-gray-800">
                    {isDifferent && <CheckCircle className="h-5 w-5 text-green-500" />}
                    <span className={cn("font-mono text-lg", "text-green-600 dark:text-green-400 font-bold")}>
                      {String(match.matchA).padStart(2, '0')}
                    </span>
                    <span className="text-muted-foreground">–</span>
                    <span className={cn("font-mono text-lg", "text-red-600 dark:text-red-400 font-bold")}>
                      {String(match.matchB).padStart(2, '0')}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-muted-foreground italic">No matches found.</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}