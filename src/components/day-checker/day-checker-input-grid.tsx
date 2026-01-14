"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DAY_COLOR_MAP, DayKey } from '@/lib/dayCheckerTypes';

interface DayCheckerInputGridProps {
    inputs: string[];
    handleInputChange: (index: number, value: string) => void;
    highlightedInputs: Record<number, string | null>;
}

export function DayCheckerInputGrid({ inputs, handleInputChange, highlightedInputs }: DayCheckerInputGridProps) {
    // Helper to render a group of 3 inputs (MIDI or SOIR)
    const renderInputGroup = (startIndex: number) => (
        <div className="flex gap-4 flex-wrap justify-center">
            {[0, 1, 2].map(offset => {
                const index = startIndex + offset;
                
                const dayKey = highlightedInputs[index];
                const style = dayKey ? DAY_COLOR_MAP[dayKey as DayKey].style : {};

                return (
                    <Input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        placeholder="00"
                        value={inputs[index]}
                        onChange={(e) => handleInputChange(index, e.target.value)}
                        className={cn(
                            // Custom circular input styling
                            "w-[80px] h-[80px] text-2xl text-center border-2 rounded-full font-bold shadow-md transition-all duration-300",
                            "focus:border-blue-500 focus:shadow-lg focus:scale-105",
                            "bg-input border-border text-foreground" // Default Shadcn/Tailwind classes
                        )}
                        style={style}
                        maxLength={2}
                    />
                );
            })}
        </div>
    );

    // Helper to render a row (MIDI group + SOIR group)
    const renderRow = (rowIndex: number) => {
        const inputsPerRow = 6; // 3 MIDI + 3 SOIR
        const midiStartIndex = rowIndex * inputsPerRow;
        const soirStartIndex = rowIndex * inputsPerRow + 3; // Start SOIR after 3 MIDI inputs
        
        return (
            <div className="flex flex-col md:flex-row justify-center gap-5 md:gap-10 mb-4">
                {/* MIDI Group */}
                {renderInputGroup(midiStartIndex)}
                {/* SOIR Group */}
                {renderInputGroup(soirStartIndex)}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            {/* Header Groups */}
            <div className="flex justify-around p-3 rounded-xl bg-muted dark:bg-gray-800 shadow-inner">
                <h2 className="text-xl font-bold text-foreground">MIDI</h2>
                <h2 className="text-xl font-bold text-foreground">SOIR</h2>
            </div>

            {/* Input Grid Rows */}
            {renderRow(0)}
            {renderRow(1)}
            {renderRow(2)}
        </div>
    );
}