"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Database } from 'lucide-react';
import { LOCATION_MAP } from '@/lib/dayCheckerTypes';

interface LocationLoadButtonsProps {
    isLoading: boolean;
    baseDate: Date | undefined;
    fetchAndPopulateInputs: (tableName: string) => void;
}

export function LocationLoadButtons({ isLoading, baseDate, fetchAndPopulateInputs }: LocationLoadButtonsProps) {
    return (
        <div className="flex flex-wrap gap-3 justify-center p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            {LOCATION_MAP.map((location) => (
                <Button
                    key={location.tableName}
                    onClick={() => fetchAndPopulateInputs(location.tableName)}
                    disabled={isLoading || !baseDate}
                    variant="outline"
                    className="gap-2"
                >
                    <Database className="h-4 w-4" />
                    Load {location.name} Data
                </Button>
            ))}
        </div>
    );
}