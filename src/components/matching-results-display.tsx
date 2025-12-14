import { getEnglishDayName } from "@/lib/data";

type MatchingResult = {
  category: string;
  subCategory: string;
  days: Record<string, number[]>;
};

interface MatchingResultsDisplayProps {
  result: MatchingResult;
}

export function MatchingResultsDisplay({ result }: MatchingResultsDisplayProps) {
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-md dark:bg-gray-900">
      <div className="font-medium mb-2">
        {/* Iterate over all days in the set */}
        {Object.entries(result.days).map(([day, numbers]) => (
          <div key={day} className="mb-1">
            <span className="font-semibold">{getEnglishDayName(day)}</span>: [{numbers.join(", ")}]
          </div>
        ))}
      </div>
    </div>
  );
}