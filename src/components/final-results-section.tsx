"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getEnglishDayName } from "@/lib/data";
import { FormattedResult, cn, getUniqueNumbersFromRawResults, getUniqueAndNonReversedNumbers } from "@/lib/utils";
import { AnalysisLog, AnalysisLogEntry } from "@/lib/schemas";
import { StepLogViewer } from "./step-log-viewer";
import { useRouter } from "next/navigation";
import { getDayNameFromDate } from "@/lib/dateUtils";
import { parseISO } from "date-fns";

// Define types needed internally for display
interface MatchingResult {
    category: string;
    subCategory: string;
    days: Record<string, number[]>;
}

interface AnalysisSet {
    id: string;
    inputIndices: number[];
    matchingResult: MatchingResult;
}

interface FinalResultsSectionProps {
    formattedFinalResults: FormattedResult[];
    mariagePairs: string[];
    analysisSets: AnalysisSet[];
    inputLabels: string[];
    detailedLog: AnalysisLog;
    rawFinalResults: string[]; // Added raw results
    resetAnalysis: () => void;
}

// Helper types for grouping
interface DayHit {
    number: number;
    type: 'strict' | 'reverse';
}
type GroupedDayHits = Record<string, DayHit[]>;

/**
 * Processes the detailed log to group all historical hits by the English day name 
 * (e.g., Monday, Tuesday) where the hit occurred.
 */
function groupHitsByDay(detailedLog: AnalysisLog): GroupedDayHits {
    const grouped: GroupedDayHits = {};

    detailedLog.forEach(entry => {
        entry.weekChecks.forEach(check => {
            check.historicalHits.forEach(hit => {
                // hit.date is a string 'yyyy-MM-dd'
                const dateObj = parseISO(hit.date);
                const dayName = getDayNameFromDate(dateObj); // e.g., "Monday"
                
                if (!grouped[dayName]) {
                    grouped[dayName] = [];
                }
                
                // Check for duplicates: only add unique number/type combinations per day
                const isDuplicate = grouped[dayName].some(
                    existingHit => existingHit.number === hit.numberFound && existingHit.type === hit.matchType
                );

                if (!isDuplicate) {
                    grouped[dayName].push({
                        number: hit.numberFound,
                        type: hit.matchType
                    });
                }
            });
        });
    });
    
    // Sort the numbers within each day group
    for (const day in grouped) {
        grouped[day].sort((a, b) => a.number - b.number);
    }

    return grouped;
}


export function FinalResultsSection({ formattedFinalResults, mariagePairs, analysisSets, inputLabels, detailedLog, rawFinalResults, resetAnalysis }: FinalResultsSectionProps) {
    const router = useRouter();
    
    // Calculate grouped day hits
    const groupedDayHits = groupHitsByDay(detailedLog);
    const dayNames = Object.keys(groupedDayHits).sort((a, b) => {
        // Custom sort order for days of the week (starting Monday)
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    const handleGoToVerify = () => {
        const uniqueNumbers = getUniqueNumbersFromRawResults(rawFinalResults);
        // Filter the list to remove duplicates and ensure no number and its reverse are both present
        const filteredNumbers = getUniqueAndNonReversedNumbers(uniqueNumbers);
        
        // Format numbers as a comma-separated string, ensuring 2 digits for consistency
        const numberString = filteredNumbers.map(n => String(n).padStart(2, '0')).join(',');
        
        if (numberString) {
            router.push(`/verifier?setA=${numberString}`);
        }
    };

    return (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Analysis Summary</h3>
            
            {/* Intermediate Mapping Section */}
            {analysisSets.length > 0 && (
                <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
                    <h4 className="font-semibold text-lg border-b pb-2 text-primary">Input Number Mappings (Found in Data)</h4>
                    {analysisSets.map((set) => {
                        const inputLabelsForSet = set.inputIndices.map(index => inputLabels[index]);
                        const dayEntries = Object.entries(set.matchingResult.days);

                        return (
                            <Card key={set.id} className="p-4 bg-gray-50 dark:bg-gray-900 border-l-4 border-blue-500">
                                <CardContent className="p-0 space-y-2">
                                    <p className="text-sm font-medium text-muted-foreground">
                                        Triggered by: <span className="font-bold text-blue-600 dark:text-blue-400">{inputLabelsForSet.join(', ')}</span>
                                    </p>
                                    <p className="font-mono text-sm">
                                        Set: {set.matchingResult.category} - {set.matchingResult.subCategory}
                                    </p>
                                    <div className="space-y-1 pt-2">
                                        {dayEntries.map(([frenchDay, numbers]) => (
                                            <p key={frenchDay} className="text-sm">
                                                <span className="font-semibold capitalize">{getEnglishDayName(frenchDay)}:</span> {numbers.join(', ')}
                                            </p>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* Individual Hits Section */}
            <div className="space-y-2">
                <div className="flex justify-between items-center border-b pb-1 mb-2">
                    <h4 className="font-semibold text-lg text-green-600 dark:text-green-400">Historical Hits (Last 8 Weeks)</h4>
                    <div className="flex gap-3 text-xs font-medium">
                        <span className="flex items-center gap-1">
                            <span className="h-3 w-3 rounded-full bg-red-500"></span> Strict Match
                        </span>
                        <span className="flex items-center gap-1">
                            <span className="h-3 w-3 rounded-full bg-blue-500"></span> Reverse Match
                        </span>
                    </div>
                </div>
                
                <div className="max-h-60 overflow-y-auto">
                    {formattedFinalResults.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                            {formattedFinalResults.map((result, index) => (
                                <span 
                                    key={index} 
                                    className={cn(
                                        "px-3 py-1 rounded-full font-mono text-lg",
                                        // Conditional styling based on match type
                                        result.type === 'strict' 
                                            ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200" // Strict matches (Red)
                                            : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200" // Reverse matches (Blue)
                                    )}
                                >
                                    {result.display}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className<dyad-problem-report summary="81 problems">
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="36" code="1005">'}' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="41" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="44" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="53" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="57" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="65" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="74" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="79" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="83" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="89" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="92" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="96" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="84" column="6" code="1005">',' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="84" column="13" code="1005">';' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="84" column="61" code="1005">';' expected.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="355" column="2" code="1005">'}' expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="59" column="10" code="17008">JSX element 'div' has no corresponding closing tag.</problem>
<problem file="src/components/step-log-viewer.tsx" line="69" column="14" code="17008">JSX element 'Table' has no corresponding closing tag.</problem>
<problem file="src/components/step-log-viewer.tsx" line="77" column="18" code="17008">JSX element 'TableBody' has no corresponding closing tag.</problem>
<problem file="src/components/step-log-viewer.tsx" line="79" column="26" code="17008">JSX element 'TableRow' has no corresponding closing tag.</problem>
<problem file="src/components/step-log-viewer.tsx" line="84" column="30" code="17008">JSX element 'TableCell' has no corresponding closing tag.</problem>
<problem file="src/components/step-log-viewer.tsx" line="86" column="38" code="17008">JSX element 'div' has no corresponding closing tag.</problem>
<problem file="src/components/step-log-viewer.tsx" line="92" column="139" code="1002">Unterminated string literal.</problem>
<problem file="src/components/step-log-viewer.tsx" line="94" column="13" code="1005">',' expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="94" column="55" code="1005">',' expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="95" column="13" code="1005">')' expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="107" column="16" code="1005">'}' expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="108" column="1" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/components/step-log-viewer.tsx" line="111" column="5" code="1109">Expression expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="138" column="1" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/components/step-log-viewer.tsx" line="141" column="10" code="1005">'}' expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="142" column="1" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/components/step-log-viewer.tsx" line="145" column="5" code="1109">Expression expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="205" column="1" code="1381">Unexpected token. Did you mean `{'}'}` or `&amp;rbrace;`?</problem>
<problem file="src/components/step-log-viewer.tsx" line="205" column="2" code="1005">'&lt;/' expected.</problem>
<problem file="src/components/step-log-viewer.tsx" line="92" column="53" code="2367">This comparison appears to be unintentional because the types 'string' and 'boolean' have no overlap.</problem>
<problem file="src/components/step-log-viewer.tsx" line="92" column="71" code="2365">Operator '&lt;' cannot be applied to types 'string' and 'number'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="94" column="2" code="2304">Cannot find name 'dyad'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="94" column="7" code="2304">Cannot find name 'write'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="94" column="13" code="2304">Cannot find name 'path'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="94" column="55" code="2304">Cannot find name 'description'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="97" column="10" code="2693">'AnalysisLog' only refers to a type, but is being used as a value here.</problem>
<problem file="src/components/step-log-viewer.tsx" line="97" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="97" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="97" column="23" code="2693">'AnalysisLogEntry' only refers to a type, but is being used as a value here.</problem>
<problem file="src/components/step-log-viewer.tsx" line="97" column="41" code="2693">'HistoricalHit' only refers to a type, but is being used as a value here.</problem>
<problem file="src/components/step-log-viewer.tsx" line="98" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="98" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="98" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="98" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="101" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="101" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="101" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="101" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="101" column="10" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="107" column="5" code="2304">Cannot find name 'detailedLog'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="110" column="33" code="2304">Cannot find name 'detailedLog'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="126" column="26" code="2304">Cannot find name 'detailedLog'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="129" column="29" code="2304">Cannot find name 'detailedLog'.</problem>
<problem file="src/components/step-log-viewer.tsx" line="129" column="46" code="7006">Parameter 'entry' implicitly has an 'any' type.</problem>
<problem file="src/components/step-log-viewer.tsx" line="129" column="53" code="7006">Parameter 'index' implicitly has an 'any' type.</problem>
<problem file="src/components/step-log-viewer.tsx" line="145" column="13" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="145" column="13" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/step-log-viewer.tsx" line="145" column="13" code="2695">Left side of comma operator is unused and has no side effects.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="72" column="48" code="2355">A function whose declared type is neither 'undefined', 'void', nor 'any' must return a value.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="34" code="2304">Cannot find name 'I'.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="36" code="7005">Variable 'need' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="41" code="7005">Variable 'to' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="44" code="7005">Variable 'complete' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="53" code="7005">Variable 'the' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="57" code="7005">Variable 'Georgia' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="65" code="7005">Variable 'analysis' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="74" code="7005">Variable 'form' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="79" code="7005">Variable 'file' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="85" code="7005">Variable 'Let' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="89" code="7005">Variable 'me' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="82" column="92" code="7005">Variable 'fix' implicitly has an 'any' type.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="84" column="7" code="2304">Cannot find name 'write'.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="84" column="13" code="2304">Cannot find name 'path'.</problem>
<problem file="src/components/georgia-analysis-form.tsx" line="84" column="61" code="2304">Cannot find name 'description'.</problem>
<problem file="src/app/georgia/page.tsx" line="41" column="10" code="2786">'GeorgiaNumberAnalysisForm' cannot be used as a JSX component.
  Its type '({ location, tableName }: GeorgiaNumberAnalysisFormProps) =&gt; void' is not a valid JSX element type.
    Type '({ location, tableName }: GeorgiaNumberAnalysisFormProps) =&gt; void' is not assignable to type '(props: any) =&gt; ReactNode | Promise&lt;ReactNode&gt;'.
      Type 'void' is not assignable to type 'ReactNode | Promise&lt;ReactNode&gt;'.</problem>
</dyad-problem-report>I need to fix the corrupted files. The issue is that the files contain `dyad-write` tags and incomplete code. Let me fix them properly:

<dyad-write path="src/components/georgia-analysis-form.tsx" description="Fix GeorgiaNumberAnalysisForm TypeScript errors">
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatFinalResults, getUniqueNumbersFromRawResults, findMariagePairs, FormattedResult } from "@/lib/utils";
import { findNumberInData } from "@/lib/data";
import { DateInputSection } from "./date-input-section";
import { FinalResultsSection } from "./final-results-section";
import { performGeorgiaDatabaseAnalysis } from "@/lib/analysis";
import { Loader2 } from "lucide-react";
import { GeorgiaNumberInputSection } from "./georgia-number-input-section";
import { AnalysisLog } from "@/lib/schemas";

// Define types needed internally
type MatchingResult = {
  category: string;
  subCategory: string;
  days: Record<string, number[]>;
};

type AnalysisSet = {
  id: string; // e.g., "lunMar-firstLM"
  inputIndices: number[]; // Indices of the original numbers that map to this set
  matchingResult: MatchingResult; // The actual data set (category, subCategory, days)
};

interface GeorgiaNumberAnalysisFormProps {
    location: string;
    tableName: string;
}

type GeorgiaAnalysisStep = 'input' | 'analyzing_day' | 'analyzing_moon' | 'analyzing_night' | 'results';

export function GeorgiaNumberAnalysisForm({ location, tableName }: GeorgiaNumberAnalysisFormProps) {
  // 9 inputs for Day (3), Moon (3), Night (3)
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [numbers, setNumbers] = useState<string[]>(Array(9).fill(""));
  
  const [analysisSets, setAnalysisSets] = useState<AnalysisSet[]>([]);
  const [rawFinalResults, setRawFinalResults] = useState<string[]>([]);
  const [detailedLog, setDetailedLog] = useState<AnalysisLog>([]);
  const [step, setStep] = useState<GeorgiaAnalysisStep>('input');

  // Define the labels for the 9 inputs
  const inputLabels = [
    "1er-Day", "2em-Day", "3em-Day",
    "1er-Moon", "2em-Moon", "3em-Moon",
    "1er-Night", "2em-Night", "3em-Night"
  ];

  // Memoize the formatted results for display
  const formattedFinalResults: FormattedResult[] = useMemo(() => {
    return formatFinalResults(rawFinalResults);
  }, [rawFinalResults]);
  
  // Calculate Mariage pairs
  const mariagePairs = useMemo(() => {
    const uniqueNumbers = getUniqueNumbersFromRawResults(rawFinalResults);
    return findMariagePairs(uniqueNumbers);
  }, [rawFinalResults]);

  const handleNumberChange = (index: number, value: string) => {
    // Only allow numbers and limit to 2 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 2);
    
    const newNumbers = [...numbers];
    newNumbers[index] = numericValue;
    setNumbers(newNumbers);
  };

  // Helper function to map inputs to sets for a given range of indices
  const mapInputsToSets = (indices: number[]): AnalysisSet[] => {
    const uniqueSetsMap = new Map<string, { indices: number[], result: MatchingResult }>();
    
    indices.forEach(index => {
        const num = numbers[index];
        if (num && !isNaN(parseInt(num))) {
            const resultsForNum = findNumberInData(parseInt(num));
            
            if (resultsForNum.length > 0) {
                const result = resultsForNum[0];
                const setId = `${result.category}-${result.subCategory}`;
                
                if (!uniqueSetsMap.has(setId)) {
                    uniqueSetsMap.set(setId, { indices: [index], result });
                } else {
                    uniqueSetsMap.get(setId)!.indices.push(index);
                }
            }
        }
    });

    return Array.from(uniqueSetsMap.entries()).map(([id, data]) => ({
        id,
        inputIndices: data.indices,
        matchingResult: data.result,
    }));
  };

  // Helper function to perform Georgia analysis and return results
  const runGeorgiaAnalysisStep = async (sets: AnalysisSet[]): Promise<{ rawResults: string[], detailedLog: AnalysisLog }> => {
    if (sets.length === 0) {
        return { rawResults: [], detailedLog: [] };
    }
    
    return performGeorgiaDatabaseAnalysis(
        date!,
        tableName,
        sets,
        inputLabels,
        numbers
    );
  };

  const handleNext = async () => {
    if (!date) return;

    // Check if all 9 inputs are filled with 2 digits
    const allInputsFilled = numbers.every(num => num && num.length === 2 && !isNaN(parseInt(num)));
    const validNumbers = numbers.filter(num => num && !isNaN(parseInt(num)));

    if (validNumbers.length === 0) {
        alert("Please enter at least one valid number.");
        return;
    }

    // Reset previous results
    setRawFinalResults([]);
    setDetailedLog([]);
    setAnalysisSets([]);

    let currentRawResults: string[] = [];
    let currentDetailedLog: AnalysisLog = [];
    let currentAnalysisSets: AnalysisSet[] = [];

    if (allInputsFilled) {
        // --- Three-Step Analysis (Day, Moon, then Night) ---
        
        // Step 1: Day Analysis (Indices 0, 1, 2)
        setStep('analyzing_day');
        const dayIndices = [0, 1, 2];
        const daySets = mapInputsToSets(dayIndices);
        currentAnalysisSets.push(...daySets);

        if (daySets.length > 0) {
            const { rawResults, detailedLog } = await runGeorgiaAnalysisStep(daySets);
            currentRawResults.push(...rawResults);
            currentDetailedLog.push(...detailedLog);
        }

        // Step 2: Moon Analysis (Indices 3, 4, 5)
        setStep('analyzing_moon');
        const moonIndices = [3, 4, 5];
        const moonSets = mapInputsToSets(moonIndices);
        currentAnalysisSets.push(...moonSets);

        if (moonSets.length > 0) {
            const { rawResults, detailedLog } = await runGeorgiaAnalysisStep(moonSets);
            currentRawResults.push(...rawResults);
            currentDetailedLog.push(...detailedLog);
        }
        
        // Step 3: Night Analysis (Indices 6, 7, 8)
        setStep('analyzing_night');
        const nightIndices = [6, 7, 8];
        const nightSets = mapInputsToSets(nightIndices);
        currentAnalysisSets.push(...nightSets);

        if (nightSets.length > 0) {
            const { rawResults, detailedLog } = await runGeorgiaAnalysisStep(nightSets);
            currentRawResults.push(...rawResults);
            currentDetailedLog.push(...detailedLog);
        }

    } else {
        // --- Single-Step Analysis (Existing logic) ---
        setStep('analyzing_day'); // Use 'analyzing_day' as a generic loading state for single step
        
        const allIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8];
        const allSets = mapInputsToSets(allIndices.filter(i => numbers[i])); // Only map indices with valid input
        currentAnalysisSets.push(...allSets);

        if (allSets.length > 0) {
            const { rawResults, detailedLog } = await runGeorgiaAnalysisStep(allSets);
            currentRawResults.push(...rawResults);
            currentDetailedLog.push(...detailedLog);
        } else {
            alert("No matching data found for entered numbers.");
        }
    }

    // Finalize state
    setAnalysisSets(currentAnalysisSets);
    setRawFinalResults(currentRawResults);
    setDetailedLog(currentDetailedLog);
    setStep('results');
  };

  const resetAnalysis = () => {
    setDate(new Date());
    setNumbers(Array(9).fill(""));
    setAnalysisSets([]);
    setRawFinalResults([]);
    setDetailedLog([]);
    setStep('input');
  };
  
  // Update rendering logic based on step
  const showResults = step === 'results';
  const isAnalyzing = step.startsWith('analyzing');

  // Determine loading message
  let loadingMessage = "Analyzing historical data...";
  if (step === 'analyzing_day') {
    loadingMessage = "Step 1/3: Analyzing DAY numbers...";
  } else if (step === 'analyzing_moon') {
    loadingMessage = "Step 2/3: Analyzing MOON numbers...";
  } else if (step === 'analyzing_night') {
    loadingMessage = "Step 3/3: Analyzing NIGHT numbers...";
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <Card className="w-full shadow-lg mb-6">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800 dark:text-gray-100">{location} Analysis</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            Enter numbers and analyze their patterns across 8 preceding weeks
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Date Input Section */}
          <DateInputSection date={date} setDate={setDate} />

          {/* Number Inputs Section */}
          {step === 'input' && (
            <GeorgiaNumberInputSection 
              numbers={numbers}
              inputLabels={inputLabels}
              handleNumberChange={handleNumberChange}
              handleNext={handleNext}
            />
          )}
          
          {/* Loading State */}
          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-lg font-medium text-muted-foreground">{loadingMessage}</p>
            </div>
          )}

          {/* Final Results Section */}
          {showResults && (
            <FinalResultsSection
              formattedFinalResults={formattedFinalResults}
              mariagePairs={mariagePairs}
              analysisSets={analysisSets}
              inputLabels={inputLabels}
              detailedLog={detailedLog}
              rawFinalResults={rawFinalResults}
              resetAnalysis={resetAnalysis}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}