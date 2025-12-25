import { cn } from "@/lib/utils";

interface DayHit {
    number: number;
    type: 'strict' | 'reverse';
}

type GroupedDayHits = Record<string, DayHit[]>;

interface DayHitsSummaryProps {
    groupedDayHits: GroupedDayHits;
}

export function DayHitsSummary({ groupedDayHits }: DayHitsSummaryProps) {
    const dayNames = Object.keys(groupedDayHits).sort((a, b) => {
        const dayOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        return dayOrder.indexOf(a) - dayOrder.indexOf(b);
    });

    if (dayNames.length === 0) return null;

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-lg text-purple-600 dark:text-purple-400">Hits by Day of Week</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayNames.map((dayName) => (
                    <div key={dayName} className="bg-white dark:bg-gray-800 p-3 rounded-lg border shadow-sm">
                        <h5 className="font-semibold mb-2 text-gray-700 dark:text-gray-300">{dayName}</h5>
                        <div className="flex flex-wrap gap-1">
                            {groupedDayHits[dayName].map((hit, index) => (
                                <span 
                                    key={index} 
                                    className={cn(
                                        "px-2 py-1 text-xs font-mono rounded",
                                        hit.type === 'strict' 
                                            ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                            : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                    )}
                                >
                                    {String(hit.number).padStart(2, '0')}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}