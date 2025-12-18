import { supabase } from "@/integrations/supabase/client";
import { getPreviousWeekDates } from "./dateUtils";
import { DatabaseRecord, GeorgiaDatabaseRecord, AnalysisLog, AnalysisLogEntry, HistoricalHit } from "./schemas";
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

// Fields for NY/FL tables (7 number fields)
const NY_FL_DB_NUMBER_FIELDS: (keyof Omit<DatabaseRecord, 'id' | 'created_at' | 'complete_date'>)[] = [
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
 * based on the "strict" rule (direct match only).
 * @param dbNum The number retrieved from the database (0-99).
 * @param targetNums The array of numbers from the analysis set (0-99).
 * @returns An object containing the matched number and match type, or null.
 */
function checkMatch(dbNum: number, targetNums: number[]): { number: number, type: 'strict' } | null {
  // Strict Match: Only return a match if the database number is directly included in the target numbers.
  if (targetNums.includes(dbNum)) {
    return { number: dbNum, type: 'strict' };
  }
  
  return null;
}


/**
 * Performs the full 5-week historical analysis against the database for all analysis sets (NY/FL).
 * @param baseDate The date selected by the user.
 * @param locationTableName The name of the database table (e.g., 'new_york_data').
 * @param analysisSets The sets derived from the user's input numbers.
 * @param inputLabels The labels for the 6 input fields.
 * @param inputNumbers The original 6 input numbers as strings
 * @returns An object containing raw result strings (for summary) and detailed log.
 */
export async function performDatabaseAnalysis(
  baseDate: Date,
  locationTableName: string,
  analysisSets: AnalysisSet[],
  inputLabels: string[],
  inputNumbers: string[] // The original 6 input numbers as strings
): Promise<{ rawResults: string[], detailedLog: AnalysisLog }> {
  
  const rawFinalResults: string[] = [];
  const detailedLogMap = new Map<number, AnalysisLogEntry>(); // Key: inputIndex

  // 1. Initialize detailed log structure for all inputs that generated a set
  analysisSets.forEach(currentSet => {
    currentSet.inputIndices.forEach(inputIndex => {
        const inputNum = parseInt(inputNumbers[inputIndex]);
        if (!detailedLogMap.has(inputIndex)) {
            detailedLogMap.set(inputIndex, {
                inputLabel: inputLabels[inputIndex],
                inputNumber: inputNum,
                analysisSetId: currentSet.id,
                historicalHits: [],
            });
        }
    });
  });

  for (const currentSet of analysisSets) {
    const { days } = currentSet.matchingResult;
    const dayKeys = Object.keys(days);
    
    if (dayKeys.length < 2) continue;

    const frenchDay1 = dayKeys[0];
    const frenchDay2 = dayKeys[1];
    
    // Iterate through 5 weeks back (weeksBack = 1 to 5)
    for (let weeksBack = 1; weeksBack <= 5; weeksBack++) {
      const weekDates = getPreviousWeekDates(baseDate, frenchDay1, frenchDay2, weeksBack);
      
      const date1 = weekDates[frenchDay1];
      const date2 = weekDates[frenchDay2];
      
      const date1String = format(date1, 'yyyy-MM-dd');
      const date2String = format(date2, 'yyyy-MM-dd');

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
        continue;
      }

      // 2. Process fetched records
      for (const record of records as DatabaseRecord[]) {
        const recordDate = record.complete_date;
        
        // Determine which day of the set this record corresponds to (needed for logging)
        const isDay1 = recordDate === date1String;
        const isDay2 = recordDate === date2String;
        
        if (!isDay1 && !isDay2) continue;

        // Determine the specific target numbers for this record's day (STRICT MATCHING)
        let targetNumbersForRecord: number[] = [];
        if (isDay1) {
            targetNumbersForRecord = days[frenchDay1];
        } else if (isDay2) {
            targetNumbersForRecord = days[frenchDay2];
        }

        // 3. Compare all database number fields against the day-specific target numbers
        for (const field of NY_FL_DB_NUMBER_FIELDS) {
          const dbNum = record[field];
          
          if (dbNum !== null && dbNum !== undefined && targetNumbersForRecord.length > 0) {
            const matchResult = checkMatch(dbNum, targetNumbersForRecord);
            
            if (matchResult !== null) {
              // A match was found! Record this hit for ALL original input numbers that generated this set.
              currentSet.inputIndices.forEach(inputIndex => {
                const inputLabel = inputLabels[inputIndex];
                
                // 1. Add to raw results (for summary display)
                rawFinalResults.push(`${inputLabel}: Week ${weeksBack}: ${matchResult.number}|${matchResult.type}`);
                
                // 2. Add to detailed log
                detailedLogMap.get(inputIndex)?.historicalHits.push({
                    week: weeksBack,
                    date: recordDate,
                    numberFound: matchResult.number,
                    matchType: matchResult.type,
                });
              });
            }
          }
        }
      }
    }
  }

  return {
    rawResults: rawFinalResults,
    detailedLog: Array.from(detailedLogMap.values()),
  };
}


/**
 * Performs the full 5-week historical analysis against the database for all analysis sets (Georgia).
 * This function is specific to the Georgia table structure (10 number fields).
 */
export async function performGeorgiaDatabaseAnalysis(
  baseDate: Date,
  locationTableName: string,
  analysisSets: AnalysisSet[],
  inputLabels: string[],
  inputNumbers: string[] // The original 9 input numbers as strings
): Promise<{ rawResults: string[], detailedLog: AnalysisLog }> {
  
  const rawFinalResults: string[] = [];
  const detailedLogMap = new Map<number, AnalysisLogEntry>(); // Key: inputIndex

  // 1. Initialize detailed log structure for all inputs that generated a set
  analysisSets.forEach(currentSet => {
    currentSet.inputIndices.forEach(inputIndex => {
        const inputNum = parseInt(inputNumbers[inputIndex]);
        if (!detailedLogMap.has(inputIndex)) {
            detailedLogMap.set(inputIndex, {
                inputLabel: inputLabels[inputIndex],
                inputNumber: inputNum,
                analysisSetId: currentSet.id,
                historicalHits: [],
            });
        }
    });
  });

  for (const currentSet of analysisSets) {
    const { days } = currentSet.matchingResult;
    const dayKeys = Object.keys(days);
    
    if (dayKeys.length < 2) continue;

    const frenchDay1 = dayKeys[0];
    const frenchDay2 = dayKeys[1];
    
    // Iterate through 5 weeks back (weeksBack = 1 to 5)
    for (let weeksBack = 1; weeksBack <= 5; weeksBack++) {
      const weekDates = getPreviousWeekDates(baseDate, frenchDay1, frenchDay2, weeksBack);
      
      const date1 = weekDates[frenchDay1];
      const date2 = weekDates[frenchDay2];
      
      const date1String = format(date1, 'yyyy-MM-dd');
      const date2String = format(date2, 'yyyy-MM-dd');

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
        continue;
      }

      // 2. Process fetched records
      for (const record of records as GeorgiaDatabaseRecord[]) {
        const recordDate = record.complete_date;
        
        // Determine which day of the set this record corresponds to (needed for logging)
        const isDay1 = recordDate === date1String;
        const isDay2 = recordDate === date2String;
        
        if (!isDay1 && !isDay2) continue;

        // Determine the specific target numbers for this record's day (STRICT MATCHING)
        let targetNumbersForRecord: number[] = [];
        if (isDay1) {
            targetNumbersForRecord = days[frenchDay1];
        } else if (isDay2) {
            targetNumbersForRecord = days[frenchDay2];
        }

        // 3. Compare all database number fields against the day-specific target numbers
        for (const field of GA_DB_NUMBER_FIELDS) {
          const dbNum = record[field];
          
          if (dbNum !== null && dbNum !== undefined && targetNumbersForRecord.length > 0) {
            const matchResult = checkMatch(dbNum, targetNumbersForRecord);
            
            if (matchResult !== null) {
              // A match was found! Record this hit for ALL original input numbers that generated this set.
              currentSet.inputIndices.forEach(inputIndex => {
                const inputLabel = inputLabels[inputIndex];
                
                // 1. Add to raw results (for summary display)
                rawFinalResults.push(`${inputLabel}: Week ${weeksBack}: ${matchResult.number}|${matchResult.type}`);
                
                // 2. Add to detailed log
                detailedLogMap.get(inputIndex)?.historicalHits.push({
                    week: weeksBack,
                    date: recordDate,
                    numberFound: matchResult.number,
                    matchType: matchResult.type,
                });
              });
            }
          }
        }
      }
    }
  }

  return {
    rawResults: rawFinalResults,
    detailedLog: Array.from(detailedLogMap.values()),
  };
}