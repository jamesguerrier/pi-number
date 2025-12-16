import { supabase } from "@/integrations/supabase/client";
import { getPreviousWeekDates } from "./dateUtils";
import { DatabaseRecord } from "./schemas";
import { format } from "date-fns";

// Define types needed internally
type MatchingResult = {
  category: string;
  subCategory: string;
  days: Record<string, number[]>;
};

type AnalysisSet = {
  id: string;
  inputIndices: number[];
  matchingResult: MatchingResult;
};

const DB_NUMBER_FIELDS: (keyof Omit<DatabaseRecord, 'id' | 'created_at' | 'complete_date'>)[] = [
  'date_number',
  'first_am_day',
  'second_am_day',
  'third_am_day',
  'first_pm_moon',
  'second_pm_moon',
  'third_pm_moon',
];

/**
 * Checks if a database number (dbNum) matches any number in the target set (targetNums)
 * based on the "strict" rule (direct match only).
 * @param dbNum The number retrieved from the database (0-99).
 * @param targetNums The array of numbers from the analysis set (0-99).
 * @returns The matching database number if a match is found, otherwise null.
 */
function checkMatch(dbNum: number, targetNums: number[]): number | null {
  // Strict Match: Only return a match if the database number is directly included in the target numbers.
  if (targetNums.includes(dbNum)) {
    return dbNum;
  }
  
  return null;
}


/**
 * Performs the full 5-week historical analysis against the database for all analysis sets.
 * @param baseDate The date selected by the user.
 * @param locationTableName The name of the database table (e.g., 'new_york_data').
 * @param analysisSets The sets derived from the user's input numbers.
 * @param inputLabels The labels for the 6 input fields.
 * @returns An array of raw result strings (e.g., "1er-AM: Week 3: 50").
 */
export async function performDatabaseAnalysis(
  baseDate: Date,
  locationTableName: string,
  analysisSets: AnalysisSet[],
  inputLabels: string[],
  inputNumbers: string[] // The original 6 input numbers as strings
): Promise<string[]> {
  
  const rawFinalResults: string[] = [];

  console.log(`--- Starting 5-Week Analysis for ${locationTableName} (Base Date: ${format(baseDate, 'PPP')}) ---`);

  for (const currentSet of analysisSets) {
    const { days } = currentSet.matchingResult;
    const dayKeys = Object.keys(days); // e.g., ['samedi', 'dimanche']
    
    if (dayKeys.length < 2) continue;

    const frenchDay1 = dayKeys[0];
    const frenchDay2 = dayKeys[1];
    
    console.log(`\nProcessing Set: ${currentSet.id} (Days: ${frenchDay1}, ${frenchDay2})`);

    // Iterate through 5 weeks back (weeksBack = 1 to 5)
    for (let weeksBack = 1; weeksBack <= 5; weeksBack++) {
      const weekDates = getPreviousWeekDates(baseDate, frenchDay1, frenchDay2, weeksBack);
      
      const date1 = weekDates[frenchDay1];
      const date2 = weekDates[frenchDay2];
      
      const date1String = format(date1, 'yyyy-MM-dd');
      const date2String = format(date2, 'yyyy-MM-dd');

      console.log(`  Week ${weeksBack}: Querying dates ${date1String} (${frenchDay1}) and ${date2String} (${frenchDay2})`);

      // 1. Fetch records for both dates in this week
      const { data: records, error } = await supabase
        .from(locationTableName)
        .select('*')
        .in('complete_date', [date1String, date2String]);

      if (error) {
        console.error(`Error fetching data for ${locationTableName} week ${weeksBack}:`, error);
        continue;
      }
      
      if (!records || records.length === 0) {
        console.log(`  Week ${weeksBack}: No historical data found for these dates.`);
        continue;
      }

      // 2. Process fetched records
      for (const record of records as DatabaseRecord[]) {
        const recordDate = record.complete_date;
        
        // Determine which day of the set this record corresponds to
        const isDay1 = recordDate === date1String;
        const isDay2 = recordDate === date2String;
        
        if (!isDay1 && !isDay2) continue;

        const currentFrenchDay = isDay1 ? frenchDay1 : frenchDay2;
        const targetNumbers = days[currentFrenchDay]; // The numbers we are looking for in this day's record
        
        console.log(`    Found Record for ${recordDate} (${currentFrenchDay}). Target Numbers: [${targetNumbers.join(', ')}]`);
        console.log(`    Record Data:`, record);

        // 3. Compare all database number fields against the target numbers
        for (const field of DB_NUMBER_FIELDS) {
          const dbNum = record[field];
          
          if (dbNum !== null && dbNum !== undefined) {
            const matchedNumber = checkMatch(dbNum, targetNumbers);
            
            if (matchedNumber !== null) {
              // A match was found! Record this hit for ALL original input numbers that generated this set.
              currentSet.inputIndices.forEach(inputIndex => {
                const inputLabel = inputLabels[inputIndex];
                // Record the actual number found in the database (dbNum), not the target number.
                rawFinalResults.push(`${inputLabel}: Week ${weeksBack}: ${dbNum}`);
              });
              console.log(`      HIT! Field: ${field}, DB Value: ${dbNum}`);
            }
          }
        }
      }
    }
  }
  
  console.log(`--- Analysis Complete. Total Hits: ${rawFinalResults.length} ---`);

  return rawFinalResults;
}