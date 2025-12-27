import { supabase } from "@/integrations/supabase/client";
import { getSpecificDayDate } from "./dateUtils";
import { reverseNumber } from "./utils";
import { DatabaseRecord, GeorgiaDatabaseRecord } from "./schemas";
import { format } from "date-fns";

export interface VerificationHit {
    date: string; // yyyy-MM-dd
    location: string;
    numberFound: number;
    matchType: 'strict' | 'reverse';
}

// Fields for NY/FL/NJ tables (7 number fields)
const NY_FL_NJ_DB_NUMBER_FIELDS = [
  'date_number',
  'first_am_day',
  'second_am_day',
  'third_am_day',
  'first_pm_moon',
  'second_pm_moon',
  'third_pm_moon',
];

// Fields for Georgia table (10 number fields)
const GA_DB_NUMBER_FIELDS = [
  'date_number',
  'first_day',
  'second_day',
  'third_day',
  'first_moon',
  'second_moon',
  'third_moon',
  'first_night',
  'second_night',
  'third_night',
];

/**
 * Performs historical verification for a list of numbers against a specific day of the week
 * across a single location table over the last 7 weeks.
 * 
 * @param baseDate The date selected by the user (reference point).
 * @param targetDayIndex The day index (0=Sun, 1=Mon, ..., 6=Sat).
 * @param inputNumbers The list of numbers (0-99) to check.
 * @param locationTableName The specific table name to check (e.g., 'new_york_data').
 * @returns A promise resolving to an array of VerificationHit objects.
 */
export async function performHistoricalVerification(
  baseDate: Date,
  targetDayIndex: number,
  inputNumbers: number[],
  locationTableName: string
): Promise<VerificationHit[]> {
  
  const allHits: VerificationHit[] = [];
  
  if (inputNumbers.length === 0) {
    return [];
  }

  // Iterate through 7 weeks back (weeksBack = 1 to 7)
  for (let weeksBack = 1; weeksBack <= 7; weeksBack++) {
    const targetDate = getSpecificDayDate(baseDate, targetDayIndex, weeksBack);
    const targetDateString = format(targetDate, 'yyyy-MM-dd');

    // Only check the selected table
    const tableName = locationTableName;
    const isGeorgia = tableName === 'georgia_data';
    const fieldsToCheck = isGeorgia ? GA_DB_NUMBER_FIELDS : NY_FL_NJ_DB_NUMBER_FIELDS;

    const { data: records, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('complete_date', targetDateString);

    if (error) {
      console.error(`Error fetching data for ${tableName} on ${targetDateString}:`, error);
      continue;
    }

    if (records && records.length > 0) {
      for (const record of records) {
        // Check all relevant number fields in the record
        for (const field of fieldsToCheck) {
          // Use 'as any' for dynamic property access across different record types
          const dbNum = (record as any)[field];
          
          if (typeof dbNum === 'number' && dbNum >= 0 && dbNum <= 99) {
            
            let matchType: 'strict' | 'reverse' | null = null;
            let numberFound: number | null = null;

            // 1. Strict Match: Check if the database number is one of the user's input numbers
            if (inputNumbers.includes(dbNum)) {
              matchType = 'strict';
              numberFound = dbNum;
            } 
            
            // 2. Reverse Match: Check if the reverse of the database number is one of the user's input numbers
            const reversedDbNum = reverseNumber(dbNum);
            if (matchType === null && inputNumbers.includes(reversedDbNum)) {
              matchType = 'reverse';
              numberFound = dbNum;
            }

            if (matchType && numberFound !== null) {
              // Check if this specific hit (numberFound, date, location) is already recorded
              const isDuplicate = allHits.some(
                  hit => hit.numberFound === numberFound && hit.date === targetDateString && hit.location === tableName
              );

              if (!isDuplicate) {
                  allHits.push({
                      date: targetDateString,
                      location: tableName,
                      numberFound: numberFound,
                      matchType: matchType,
                  });
              }
            }
          }
        }
      }
    }
  }
  
  // Sort results by date (newest first)
  allHits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return allHits;
}