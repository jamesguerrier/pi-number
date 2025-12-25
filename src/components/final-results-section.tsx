"use client";

import { AnalysisLog, AnalysisLogEntry } from "@/lib/schemas";
import { getDayNameFromDate } from "@/lib/dateUtils";
import { parseISO } from "date-fns";
import { AnalysisSetCard } from "./analysis-set-card";
import { HistoricalHitsDisplay } from "./historical-hits-display";
import { DayHitsSummary } from "./day-hits-summary";
import { MariagePairsDisplay } from "./mariage-pairs-display";
import { ActionButtons } from "./action-buttons";

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
    formattedFinalResults: any[];
    mariagePairs: string[];
    analysisSets: AnalysisSet[];
    inputLabels: string[];
    detailedLog: AnalysisLog;
    rawFinalResults: string[];
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
                const dateObj = parseISO(hit.date);
                const dayName = getDayNameFromDate(dateObj);
                
                if (!grouped[dayName]) {
                    grouped[dayName] = [];
                }
                
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
    
    for (const day in grouped) {
        grouped[day].sort((a, b) => a.number - b.number);
    }

    return grouped;
}

export function FinalResultsSection({ 
    formattedFinalResults, 
    mariagePairs, 
    analysisSets, 
    inputLabels, 
    detailedLog, 
    rawFinalResults, 
    resetAnalysis 
}: FinalResultsSectionProps) {
    const groupedDayHits = groupHitsByDay(detailedLog);

    return (
        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border space-y-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Analysis Summary</h3>
            
            {/* Intermediate Mapping Section */}
            {analysisSets.length > 0 && (
                <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner">
                    <h4 className="font-semibold text-lg border-b pb-2 text-primary">Input Number Mappings (Found in Data)</h4>
                    {analysisSets.map((set) => (
                        <AnalysisSetCard key={set.id} set={set} inputLabels={inputLabels} />
                    ))}
                </div>
            )}

            {/* Historical Hits Section */}
            <HistoricalHitsDisplay formattedFinalResults={formattedFinalResults} />

            {/* Day Hits Summary */}
            <DayHitsSummary groupedDayHits={groupedDayHits} />

            {/* Mariage Pairs Section */}
            <MariagePairsDisplay mariagePairs={mariagePairs} />

            {/* Action Buttons */}
            <ActionButtons 
                rawFinalResults={rawFinalResults}
                resetAnalysis={resetAnalysis}
                detailedLog={detailedLog}
            />
        </div>
    );
}