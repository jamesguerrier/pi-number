import { subDays, format } from "date-fns";

// Function to get specific days for a week based on French day names
export function getDaysForWeek(baseDate: Date, frenchDay1: string, frenchDay2: string) {
  // Map French day names to day of week (0 = Sunday, 1 = Monday, etc.)
  const frenchDayMap: Record<string, number> = {
    'dimanche': 0,
    'lundi': 1,
    'mardi': 2,
    'mercredi': 3,
    'jeudi': 4,
    'vendredi': 5,
    'samedi': 6
  };

  const day1Index = frenchDayMap[frenchDay1.toLowerCase()];
  const day2Index = frenchDayMap[frenchDay2.toLowerCase()];
  
  if (day1Index === undefined || day2Index === undefined) {
    return {};
  }

  // Get the most recent occurrence of each day before/on the base date
  const getMostRecentDay = (targetDayIndex: number) => {
    const baseDayIndex = baseDate.getDay();
    let daysDiff = baseDayIndex - targetDayIndex;
    if (daysDiff < 0) daysDiff += 7;
    return subDays(baseDate, daysDiff);
  };

  const day1Date = getMostRecentDay(day1Index);
  const day2Date = getMostRecentDay(day2Index);

  // If day2 is before day1, go back another week for day2
  // This logic ensures both days fall within the same logical week span relative to the reference date.
  if (day2Date < day1Date) {
    return {
      [frenchDay1]: day1Date,
      [frenchDay2]: subDays(day2Date, 7)
    };
  }

  return {
    [frenchDay1]: day1Date,
    [frenchDay2]: day2Date
  };
}

// Function to get dates for specific days in previous weeks
export function getPreviousWeekDates(baseDate: Date, frenchDay1: string, frenchDay2: string, weeksBack: number) {
  // weeksBack is 1, 2, 3, 4. We want to subtract 0, 7, 14, 21 days respectively.
  const daysToSubtract = (weeksBack - 1) * 7;
  const baseForWeek = subDays(baseDate, daysToSubtract);
  
  // Use the adjusted base date to find the specific days within that week span
  return getDaysForWeek(baseForWeek, frenchDay1, frenchDay2);
}

// Function to format date in French style
export function formatDateFrench(date: Date): string {
  return format(date, "dd MMMM yyyy");
}

// Function to get day name in English from date
export function getDayNameFromDate(date: Date): string {
  return format(date, 'EEEE');
}

/**
 * Gets the date of a specific target day (English name) for a given week back, 
 * relative to the base date.
 */
export function getPreviousTargetDayDate(baseDate: Date, targetDayEnglish: string, weeksBack: number): Date {
  const dayMap: Record<string, number> = {
    'Sunday': 0,
    'Monday': 1,
    'Tuesday': 2,
    'Wednesday': 3,
    'Thursday': 4,
    'Friday': 5,
    'Saturday': 6
  };
  
  const targetDayIndex = dayMap[targetDayEnglish];
  if (targetDayIndex === undefined) {
    throw new Error(`Invalid day name: ${targetDayEnglish}`);
  }

  // Calculate the base date for the target week (weeksBack = 1 means current week, 2 means 7 days back, etc.)
  const daysToSubtract = (weeksBack - 1) * 7;
  let currentBaseDate = subDays(baseDate, daysToSubtract);
  
  // Find the most recent occurrence of the target day before/on the currentBaseDate
  const baseDayIndex = currentBaseDate.getDay();
  let daysDiff = baseDayIndex - targetDayIndex;
  if (daysDiff < 0) daysDiff += 7; // Wrap around if target day is later in the week
  
  return subDays(currentBaseDate, daysDiff);
}