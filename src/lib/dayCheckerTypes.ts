// Day color map for display and styling (using French keys for logic, but English names for display)
export const DAY_COLOR_MAP = {
    'lundi': { name: 'Monday', indicatorColor: '#90ee90', style: { backgroundColor: '#90ee90', borderColor: '#228b22', color: '#006400', fontWeight: 'bold' } },
    'jeudi': { name: 'Thursday', indicatorColor: '#add8e6', style: { backgroundColor: '#add8e6', borderColor: '#1e90ff', color: '#00008b', fontWeight: 'bold' } },
    'mardi': { name: 'Tuesday', indicatorColor: '#ffb6c1', style: { backgroundColor: '#ffb6c1', borderColor: '#ff69b4', color: '#8b0000', fontWeight: 'bold' } },
    'vendredi': { name: 'Friday', indicatorColor: '#ffd700', style: { backgroundColor: '#ffd700', borderColor: '#ff8c00', color: '#8b4513', fontWeight: 'bold' } },
    'mercredi': { name: 'Wednesday', indicatorColor: '#d8bfd8', style: { backgroundColor: '#d8bfd8', borderColor: '#9400d3', color: '#4b0082', fontWeight: 'bold' } },
    'samedi': { name: 'Saturday', indicatorColor: '#ffa07a', style: { backgroundColor: '#ffa07a', borderColor: '#ff4500', color: '#8b0000', fontWeight: 'bold' } },
    'dimanche': { name: 'Sunday', indicatorColor: '#f0e68c', style: { backgroundColor: '#f0e68c', borderColor: '#daa520', color: '#8b4513', fontWeight: 'bold' } },
};

export type DayKey = keyof typeof DAY_COLOR_MAP;

export interface MatchDetail {
    array: number[];
    foundNumbers: number[];
    location: string;
    matchCount: number;
    totalInArray: number;
    percentage: number;
}

export interface DayMatchResult {
    day: string; // French day name key
    name: string; // English day name
    indicatorColor: string;
    matches: MatchDetail[];
    totalArraysFound: number;
    totalNumbersMatched: number;
}

export type MinimalRecord = {
    first_am_day: number | null;
    second_am_day: number | null;
    third_am_day: number | null;
    first_pm_moon: number | null;
    second_pm_moon: number | null;
    third_pm_moon: number | null;
};

export const LOCATION_MAP = [
    { name: "New York", tableName: "new_york_data" },
    { name: "Florida", tableName: "florida_data" },
    { name: "New Jersey", tableName: "new_jersey_data" },
];

// Custom button styles based on provided CSS gradients
export const buttonBaseClasses = "px-4 py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg hover:translate-y-[-3px]";
export const primaryButtonStyles = {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
};
export const clearButtonStyles = {
    background: 'linear-gradient(135deg, #f56565 0%, #ed64a6 100%)',
    boxShadow: '0 4px 15px rgba(245, 101, 101, 0.3)',
};