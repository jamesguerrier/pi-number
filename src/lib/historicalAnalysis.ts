import { supabase } from "@/integrations/supabase/client";
import { getPreviousTargetDayDate } from "./dateUtils";
import { DatabaseRecord, GeorgiaDatabaseRecord, HistoricalVerificationHit } from "./schemas";
import { format } from "date-fns";
import { reverseNumber } from "./utils";

// Fields for NY/FL/NJ tables (7 number fields)
const NY_FL_NJ_DB_NUMBER_FIELDS: (keyof Omit<DatabaseRecord, 'id' | 'created_at' | 'complete_date'>)[] = [
  'date_number',
  'first_am_day',
  'second_am_day',
  'third_am_day',
  'first_pm_moon',
  'second_pm_moon',
  'third_pm_moon',
];

// Fields for Georgia table (10 number fields)
const GA_DB_NUMBER_FIELDS: (keyof Omit<GeorgiaDatabaseRecord, 'id' | 'created_at' | 'complete_date'>)[] = [
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
 * Checks if a database number (dbNum) matches any number in the target set (targetNums)
 * based on the "strict" rule (direct match) or "reverse" rule (mirror match).
 * @param dbNum The number retrieved from the database (0-99).
 * @param targetNums The array of numbers from the input set (0-99).
 * @returns An object containing the matched number and match type, or null.
 */
function checkMatch(dbNum: number, targetNums: number[]): { number: number, type: 'strict' | 'reverse' } | null {
  // 1. Strict Match: Direct inclusion
  if (targetNums.includes(dbNum)) {
    return { number: dbNum, type: 'strict' };
  }
  
  // 2. Reverse Match: Check if the reverse of the database number is in the target set
  const reversedDbNum = reverseNumber(dbNum);
  if (targetNums.includes(reversedDbNum)) {
    // We return the database number (dbNum) that was found, but mark the match type as 'reverse'.
    return { number: dbNum, type: 'reverse' };
  }
  
  return null;
}

/**
 * Performs a 7-week historical verification for specific numbers against a single target day.
 * @param baseDate The date selected by the user (search starts from this week).
 * @param tableName The name of the database table.
 * @param targetDayEnglish The English name of the day to check (e.g., 'Monday').
 * @param inputNumbers The numbers to search for (0-99).
 * @returns An array of HistoricalVerificationHit objects.
 */
export async function performHistoricalVerification(
  baseDate: Date,
  tableName: string,
  targetDayEnglish: string,
  inputNumbers: number[]
): Promise<HistoricalVerificationHit[]> {
  
  const hits: HistoricalVerificationHit[] = [];
  
  // Determine which set of fields to check based on the table name
  const isGeorgia = tableName === 'georgia_data';
  const numberFields = isGeorgia ? GA_DB_NUMBER_FIELDS : NY_FL_NJ_DB_NUMBER_FIELDS;

  // Iterate through 7 weeks back (weeksBack = 1 to 7)
  for (let weeksBack = 1; weeksBack <= 7; weeksBack++) {
    const targetDate = getPreviousTargetDayDate(baseDate, targetDayEnglish, weeksBack);
    const targetDateString = format(targetDate, 'yyyy-MM-dd');
    
    // 1. Fetch record for the target date
    const { data: records, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('complete_date', targetDateString);

    if (error) {
      console.error(`Error fetching data for ${tableName} on ${targetDateString}:`, error);
      continue;
    }
    
    if (records && records.length > 0) {
      const record = records[0]; // Should only be one record per date
      
      // Use a Set to track unique numbers found in this record to avoid reporting the same number multiple times
      const uniqueHitsInRecord = new Set<string>(); 

      // 2. Compare all database number fields against the input numbers
      for (const field of numberFields) {
        // We need to handle the type difference between DatabaseRecord and GeorgiaDatabaseRecord
        const dbNum = (record as any)[field]; 
        
        if (dbNum !== null && dbNum !== undefined && inputNumbers.length > 0) {
          const matchResult = checkMatch(dbNum, inputNumbers);
          
          if (matchResult !== null) {
            // FIX: Use matchResult.type
            const hitKey = `${matchResult.number}|${matchResult.type}`;
            
            if (!uniqueHitsInRecord.has(hitKey)) {
              uniqueHitsInRecord.add(hitKey);
              
              hits.push({
                date: targetDateString,
                numberFound: matchResult.number,
                matchType: matchResult.type,
                tableName: tableName,
              });
            }
          }
        }
      }
    }
  }
  
  return hits;
}