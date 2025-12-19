import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type FormattedResult = {
  number: string; // The number string (e.g., '70')
  count: number;
  type: 'strict' | 'reverse'; // Match type
  display: string; // The final display string (e.g., '70 (2 times)')
};

/**
 * Takes an array of result strings, extracts the numbers and types, counts their occurrences,
 * and returns a formatted array of objects for display.
 * The input strings are expected to be in the format: "LABEL: Week X: NUMBER|TYPE"
 */
export function formatFinalResults(results: string[]): FormattedResult[] {
  // Key: "number|type" -> Value: count
  const numberTypeCounts: Record<string, number> = {};
  
  // 1. Extract numbers, types, and count occurrences
  results.forEach(result => {
    // Regex to extract the number and type at the end of the string
    const match = result.match(/:\s*(\d+)\|(strict|reverse)$/);
    if (match && match[1] && match[2]) {
      const number = match[1];
      const type = match[2];
      const key = `${number}|${type}`;
      numberTypeCounts[key] = (numberTypeCounts[key] || 0) + 1;
    }
  });

  // 2. Format the unique numbers with their counts and type
  const formattedResults: FormattedResult[] = [];
  
  for (const [key, count] of Object.entries(numberTypeCounts)) {
    const [number, type] = key.split('|');
    
    const display = count > 1 ? `${number} (${count} times)` : number;

    formattedResults.push({
      number,
      count,
      type: type as 'strict' | 'reverse', // Cast to the union type
      display
    });
  }

  // Sort numerically for better presentation
  formattedResults.sort((a, b) => {
    const numA = parseInt(a.number);
    const numB = parseInt(b.number);
    return numA - numB;
  });

  return formattedResults;
}

/**
 * Extracts unique numbers (as integers) from the raw result strings.
 * Input strings are expected to be in the format: "LABEL: Week X: NUMBER|TYPE"
 */
export function getUniqueNumbersFromRawResults(results: string[]): number[] {
  const uniqueNumbers = new Set<number>();
  results.forEach(result => {
    // Regex to extract the number before the pipe
    const match = result.match(/:\s*(\d+)\|/);
    if (match && match[1]) {
      uniqueNumbers.add(parseInt(match[1]));
    }
  });
  return Array.from(uniqueNumbers).sort((a, b) => a - b);
}

/**
 * Helper function to get unique digits of a 2-digit number (0-99).
 */
function getDigits(n: number): Set<number> {
  // Pad to 2 digits (e.g., 5 -> '05')
  const s = String(n).padStart(2, '0'); 
  const digits = new Set<number>();
  digits.add(parseInt(s[0]));
  digits.add(parseInt(s[1]));
  return digits;
}

/**
 * Finds pairs of numbers that share exactly one digit (Mariage).
 * Pairs are formatted as "(XX x YY)".
 */
export function findMariagePairs(numbers: number[]): string[] {
  const pairs: Set<string> = new Set();
  const results: string[] = [];

  // Iterate through all unique pairs (i < j to avoid duplicates and self-pairing)
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      const numA = numbers[i];
      const numB = numbers[j];

      const digitsA = getDigits(numA);
      const digitsB = getDigits(numB);

      let commonDigitCount = 0;
      
      // Check how many digits are shared
      digitsA.forEach(digitA => {
        if (digitsB.has(digitA)) {
          commonDigitCount++;
        }
      });
      
      // We need exactly one common digit.
      if (commonDigitCount === 1) {
        // Format the pair (e.g., 24 x 45), ensuring 2 digits
        const formattedA = String(numA).padStart(2, '0');
        const formattedB = String(numB).padStart(2, '0');
        
        const pairString = `(${formattedA} x ${formattedB})`;
        
        // Use a sorted key to prevent duplicate pairs (e.g., 24-45 and 45-24)
        const sortedPairKey = [numA, numB].sort((a, b) => a - b).join('-');
        
        if (!pairs.has(sortedPairKey)) {
          pairs.add(sortedPairKey);
          results.push(pairString);
        }
      }
    }
  }
  
  return results;
}

const ADMIN_EMAILS = [
  "jamesguerrier72@gmail.com",
  "flemingshiping@gmail.com",
];

/**
 * Checks if the user's email is in the list of authorized admin emails.
 */
export function isUserAdmin(email: string | undefined | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}