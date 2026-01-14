"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buttonBaseClasses, primaryButtonStyles, clearButtonStyles } from '@/lib/dayCheckerTypes';

interface DayCheckerActionButtonsProps {
    isLoading: boolean;
    handleSearchRange: (day1: string, day2: string) => void;
    handleClearAll: () => void;
}

export function DayCheckerActionButtons({ isLoading, handleSearchRange, handleClearAll }: DayCheckerActionButtonsProps) {
    return (
        <div className="flex flex-wrap gap-3 justify-center">
            <Button 
                onClick={() => handleSearchRange('lundi', 'jeudi')}
                className={buttonBaseClasses}
                style={primaryButtonStyles}
                disabled={isLoading}
            >
                Monday and Thursday
            </Button>
            <Button 
                onClick={() => handleSearchRange('mardi', 'vendredi')}
                className={buttonBaseClasses}
                style={primaryButtonStyles}
                disabled={isLoading}
            >
                Tuesday - Friday
            </Button>
            <Button 
                onClick={() => handleSearchRange('mercredi', 'samedi')}
                className={buttonBaseClasses}
                style={primaryButtonStyles}
                disabled={isLoading}
            >
                Wednesday and Saturday
            </Button>
            <Button 
                onClick={() => handleSearchRange('dimanche', 'lundi')}
                className={buttonBaseClasses}
                style={primaryButtonStyles}
                disabled={isLoading}
            >
                Sunday and Monday
            </Button>
            <Button 
                onClick={handleClearAll}
                className={cn(buttonBaseClasses, "clear-btn")}
                style={clearButtonStyles}
                disabled={isLoading}
            >
                Clear All
            </Button>
        </div>
    );
}