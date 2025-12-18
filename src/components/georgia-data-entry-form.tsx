"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GeorgiaDataEntryFormValues, GeorgiaDataEntrySchema } from "@/lib/schemas";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface GeorgiaDataEntryFormProps {
  tableName: string;
  onSuccess: () => void;
}

const numberFields = [
  { name: "date_number", label: "Date Number" },
  // Day
  { name: "first_day", label: "1st Day" },
  { name: "second_day", label: "2nd Day" },
  { name: "third_day", label: "3rd Day" },
  // Moon
  { name: "first_moon", label: "1st Moon" },
  { name: "second_moon", label: "2nd Moon" },
  { name: "third_moon", label: "3rd Moon" },
  // Night
  { name: "first_night", label: "1st Night" },
  { name: "second_night", label: "2nd Night" },
  { name: "third_night", label: "3rd Night" },
] as const;

export function GeorgiaDataEntryForm({ tableName, onSuccess }: GeorgiaDataEntryFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<GeorgiaDataEntryFormValues>({
    resolver: zodResolver(GeorgiaDataEntrySchema),
    defaultValues: {
      complete_date: format(new Date(), "yyyy-MM-dd"),
      date_number: 0,
      first_day: 0,
      second_day: 0,
      third_day: 0,
      first_moon: 0,
      second_moon: 0,
      third_moon: 0,
      first_night: 0,
      second_night: 0,
      third_night: 0,
    },
  });

  async function onSubmit(values: GeorgiaDataEntryFormValues) {
    setIsSubmitting(true);
    
    // Convert number fields to actual numbers
    const payload = {
      ...values,
      date_number: Number(values.date_number),
      first_day: Number(values.first_day),
      second_day: Number(values.second_day),
      third_day: Number(values.third_day),
      first_moon: Number(values.first_moon),
      second_moon: Number(values.second_moon),
      third_moon: Number(values.third_moon),
      first_night: Number(values.first_night),
      second_night: Number(values.second_night),
      third_night: Number(values.third_night),
    };

    const { error } = await supabase
      .from(tableName)
      .insert([payload]);

    if (error) {
      toast.error(`Failed to add data to ${tableName}: ${error.message}`);
    } else {
      toast.success(`Data successfully added to ${tableName}.`);
      form.reset({
        ...form.getValues(),
        date_number: 0,
        first_day: 0,
        second_day: 0,
        third_day: 0,
        first_moon: 0,
        second_moon: 0,
        third_moon: 0,
        first_night: 0,
        second_night: 0,
        third_night: 0,
      });
      onSuccess();
    }
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Picker */}
          <FormField
            control={form.control}
            name="complete_date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Complete Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {numberFields.map((fieldConfig) => (
            <FormField
              key={fieldConfig.name}
              control={form.control}
              name={fieldConfig.name as keyof GeorgiaDataEntryFormValues}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{fieldConfig.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0-99"
                      {...field}
                      onChange={(e) => {
                        // Ensure input is treated as a string for validation, but limit length
                        const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                        field.onChange(value);
                      }}
                      className="text-center font-bold"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Submit New Record"
          )}
        </Button>
      </form>
    </Form>
  );
}