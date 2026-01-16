"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buttonBaseClasses, primaryButtonStyles, clearButtonStyles } from '@/lib/dayCheckerTypes';

interface DayCheckerSide2ActionButtonsProps {
    isLoading: boolean;
    handleSearchMatches: () => void;
    handleClearAll: () => void;
}

export function DayCheckerSide2ActionButtons({ isLoading, handleSearchMatches, handleClearAll }: DayCheckerSide2ActionButtonsProps) {
    return (
        <div className="flex flex-wrap gap-3 justify-center">
            <Button 
                onClick={handleSearchMatches}
                className={buttonBaseClasses}
                style={primaryButtonStyles}
                disabled={isLoading}
            >
                Search Matches
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