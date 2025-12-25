import { Card, CardContent } from "@/components/ui/card";
import { getEnglishDayName } from "@/lib/data";

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

interface AnalysisSetCardProps {
    set: AnalysisSet;
    inputLabels: string[];
}

export function AnalysisSetCard({ set, inputLabels }: AnalysisSetCardProps) {
    const inputLabelsForSet = set.inputIndices.map(index => inputLabels[index]);
    const dayEntries = Object.entries(set.matchingResult.days);

    return (
        <Card className="p-4 bg-gray-50 dark:bg-gray-900 border-l-4 border-blue-500">
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
}