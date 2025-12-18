import { z } from "zod";

// Schema for New York and Florida data (7 number fields)
export const DataEntrySchema = z.object({
  complete_date: z.string().min(1, "Date is required"),
  date_number: z.coerce.number().min(0).max(99),
  first_am_day: z.coerce.number().min(0).max(99),
  second_am_day: z.coerce.number().min(0).max(99),
  third_am_day: z.coerce.number().min(0).max(99),
  first_pm_moon: z.coerce.number().min(0).max(99),
  second_pm_moon: z.coerce.number().min(0).max(99),
  third_pm_moon: z.coerce.number().min(0).max(99),
});

export type DataEntryFormValues = z.infer<typeof DataEntrySchema>;

// Define the structure of the data retrieved from the database (NY/FL)
export const DatabaseRecordSchema = DataEntrySchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
});

export type DatabaseRecord = z.infer<typeof DatabaseRecordSchema>;


// Schema for Georgia data (10 number fields)
export const GeorgiaDataEntrySchema = z.object({
  complete_date: z.string().min(1, "Date is required"),
  date_number: z.coerce.number().min(0).max(99),
  
  // Day
  first_day: z.coerce.number().min(0).max(99),
  second_day: z.coerce.number().min(0).max(99),
  third_day: z.coerce.number().min(0).max(99),
  
  // Moon
  first_moon: z.coerce.number().min(0).max(99),
  second_moon: z.coerce.number().min(0).max(99),
  third_moon: z.coerce.number().min(0).max(99),
  
  // Night
  first_night: z.coerce.number().min(0).max(99),
  second_night: z.coerce.number().min(0).max(99),
  third_night: z.coerce.number().min(0).max(99),
});

export type GeorgiaDataEntryFormValues = z.infer<typeof GeorgiaDataEntrySchema>;

// Define the structure of the data retrieved from the database (GA)
export const GeorgiaDatabaseRecordSchema = GeorgiaDataEntrySchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
});

export type GeorgiaDatabaseRecord = z.infer<typeof GeorgiaDatabaseRecordSchema>;