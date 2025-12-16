import { z } from "zod";

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

// Define the structure of the data retrieved from the database
export const DatabaseRecordSchema = DataEntrySchema.extend({
  id: z.string().uuid(),
  created_at: z.string(),
});

export type DatabaseRecord = z.infer<typeof DatabaseRecordSchema>;