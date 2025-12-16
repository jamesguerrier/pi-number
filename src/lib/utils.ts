import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Takes an array of result strings, extracts the numbers, counts their occurrences,
 * and returns a formatted array of strings (e.g., "70 (2 times)").
 * The input strings are expected to be in the format: "LABEL: Week X (DATE1/DATE2): NUMBER"
 */
export function formatFinalResults(results: string[]): string[] {
  const numberCounts: Record<string, number> = {};
  
  // 1. Extract numbers and count occurrences
  results.forEach(result => {
    // Regex to extract the number at the end of the string
    const match = result.match(/:\s*(\d+)$/);
    if (match && match[1]) {
      const number = match[1];
      numberCounts[number] = (numberCounts[number] || 0) + 1;
    }
  });

  // 2. Format the unique numbers with their counts
  const formattedResults: string[] = [];
  for (const [number, count] of Object.entries(numberCounts)) {
    if (count > 1) {
      formattedResults.push(`${number} (${count} times)`);
    } else {
      formattedResults.push(number);
    }
  }

  // Sort numerically for better presentation
  formattedResults.sort((a, b) => {
    const numA = parseInt(a.split(' ')[0]);
    const numB = parseInt(b.split(' ')[0]);
    return numA - numB;
  });

  return formattedResults;
}

/**
 * Extracts unique numbers (as integers) from the raw result strings.
 */
export function getUniqueNumbersFromRawResults(results: string[]): number[] {
  const uniqueNumbers = new Set<number>();
  results.forEach(result => {
    const match = result.match(/:\s*(\d+)$/);
    if (match && match[1]) {
      uniqueNumbers.add(parseInt(match[1]));
    }
  });
  return Array.from(uniqueNumbers).sort((a, b) => a - b);
}

/**
 * Finds numbers that appeared more than once in the historical analysis.
 * Returns formatted strings (e.g., "70 (2 times)").
 */
export function getMultiHitNumbers(results: string[]): string[] {
  const numberCounts: Record<string, number> = {};
  
  // 1. Extract numbers and count occurrences
  results.forEach(result => {
    const match = result.match(/:\s*(\d+)$/);
    if (match && match[1]) {
      const number = match[1];
      numberCounts[number] = (numberCounts[number] || 0) + 1;
    }
  });

  // 2. Format only numbers with count > 1
  const multiHitResults: string[] = [];
  for (const [number, count] of Object.entries(numberCounts)) {
    if (count > 1) {
      multiHitResults.push(`${number} (${count} times)`);
    }
  }

  // Sort numerically for better presentation
  multiHitResults.sort((a, b) => {
    const numA = parseInt(a.split(' ')[0]);
    const numB = parseInt(b.split(' ')[0]);
    return numA - numB;
  });

  return multiHitResults;
}