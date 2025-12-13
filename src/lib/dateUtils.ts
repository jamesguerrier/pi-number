import { addDays, subDays, format, startOfWeek, endOfWeek } from "date-fns";

// Function to get dates for 4 weeks back from a given date
export function getFourWeekDates(startDate: Date) {
  const weeks = [];
  
  for (let i = 0; i < 4; i++) {
    const weekStart = subDays(startDate, (i + 1) * 7);
    const weekEnd = subDays(startDate, i * 7);
    
    weeks.push({
      weekNumber: i + 1,
      start: weekStart,
      end: weekEnd,
      label: `Week ${i + 1} (${format(weekStart, 'MMM dd')} - ${format(weekEnd, 'MMM dd')})`
    });
  }
  
  return weeks;
}

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
  const baseForWeek = subDays(baseDate, weeksBack * 7);
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