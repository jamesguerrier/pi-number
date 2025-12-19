"use client";

import React, { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { VERIFIER_DATA } from '@/lib/verifierData';
import { cn } from '@/lib/utils';
import { useSearchParams } from 'next/navigation';
import { CheckCircle } from 'lucide-react'; // Import CheckCircle

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

export function VerifierTool() {
  const searchParams = useSearchParams();
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');
  const [results, setResults] = useState<MatchResult[]>([]);

  useEffect(() => {
    const setAFromUrl = searchParams.get('setA');
    if (setAFromUrl) {
      // Pre-populate inputA with the numbers passed from the analysis page
      setInputA(setAFromUrl);
    }
  }, [searchParams]);

  const matchNumbers = () => {
    const A = parseInput(inputA);
    const B = parseInput(inputB);
    const foundMatches: MatchResult[] = [];

    VERIFIER_DATA.forEach(row => {
      // Find the first number in the row that is also in list A
      const matchA = row.find(n => A.includes(n));
      // Find the first number in the row that is also in list B
      const matchB = row.find(n => B.includes(n));

      if (matchA !== undefined && matchB !== undefined) {
        // Check if this specific pair has already been found to avoid duplicates
        // Note: The original logic checked for (A, B) and (B, A) duplicates, which is correct.
        const isDuplicate = foundMatches.some(
            m => (m.matchA === matchA && m.matchB === matchB) || (m.matchA === matchB && m.matchB === matchA)
        );
        
        if (!isDuplicate) {
            foundMatches.push({ matchA, matchB });
        }
      }
    });

    setResults(foundMatches);
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

        <Button onClick={matchNumbers} className="w-full">
          Check Matches
        </Button>

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