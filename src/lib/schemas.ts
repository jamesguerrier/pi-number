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

// --- Profile Schema ---
export const ProfileSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().max(50).optional().nullable(),
  avatar_url: z.string().url("Must be a valid URL").optional().nullable().or(z.literal('')),
});

export type ProfileFormValues = z.infer<typeof ProfileSchema>;