import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface GeorgiaNumberInputSectionProps {
    numbers: string[]; // Expected length 9
    inputLabels: string[]; // Expected length 9
    handleNumberChange: (index: number, value: string) => void;
    handleNext: () => void;
}

export function GeorgiaNumberInputSection({ numbers, inputLabels, handleNumberChange, handleNext }: GeorgiaNumberInputSectionProps) {
    // Check if at least one input has a valid number
    const hasValidInput = numbers.some(num => num && !isNaN(parseInt(num)));

    const renderInputGroup = (title: string, startIndex: number, colorClass: string) => (
        <div className="space-y-4">
            <div className="flex items-center justify-center">
                <h3 className={`text-lg font-semibold text-gray-800 dark:text-gray-100 px-4 py-2 rounded-md ${colorClass}`}>{title}</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
                {[0, 1, 2].map((offset) => {
                    const index = startIndex + offset;
                    return (
                        <div key={index} className="space-y-2">
                            <label className="text-xs text-gray-500 dark:text-gray-400">{inputLabels[index]}</label>
                            <Input
                                type="text"
                                inputMode="numeric"
                                placeholder="00"
                                value={numbers[index]}
                                onChange={(e) => handleNumberChange(index, e.target.value)}
                                className="text-center text-2xl font-bold h-14"
                                maxLength={2}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter Nine 2-Digit Numbers</label>
            
            {/* DAY Section (Indices 0, 1, 2) */}
            {renderInputGroup("DAY", 0, "bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100")}

            {/* MOON Section (Indices 3, 4, 5) */}
            {renderInputGroup("MOON", 3, "bg-blue-100 dark:bg-blue-900 dark:text-blue-100")}

            {/* NIGHT Section (Indices 6, 7, 8) */}
            {renderInputGroup("NIGHT", 6, "bg-purple-100 dark:bg-purple-900 dark:text-purple-100")}

            {/* Next Button */}
            <div className="pt-4">
                <Button 
                    onClick={handleNext}
                    className="w-full h-12 text-lg font-semibold"
                    size="lg"
                    disabled={!hasValidInput}
                >
                    Analyze Numbers
                </Button>
            </div>
        </div>
    );
}