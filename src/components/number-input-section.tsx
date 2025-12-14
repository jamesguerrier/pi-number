import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NumberInputSectionProps {
    numbers: string[];
    inputLabels: string[];
    handleNumberChange: (index: number, value: string) => void;
    handleNext: () => void;
}

export function NumberInputSection({ numbers, inputLabels, handleNumberChange, handleNext }: NumberInputSectionProps) {
    const hasValidInput = numbers.some(num => num && !isNaN(parseInt(num)));

    return (
        <div className="space-y-6">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Enter Six 2-Digit Numbers</label>
            
            {/* DAY Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-center">
                    <h3 className="text-lg font-semibold text-gray-800 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100 px-4 py-2 rounded-md">DAY</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[0, 1, 2].map((index) => (
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
                    ))}
                </div>
            </div>

            {/* MOON Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-center">
                    <h3 className="text-lg font-semibold text-gray-800 bg-blue-100 dark:bg-blue-900 dark:text-blue-100 px-4 py-2 rounded-md">MOON</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[3, 4, 5].map((index) => (
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
                    ))}
                </div>
            </div>

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