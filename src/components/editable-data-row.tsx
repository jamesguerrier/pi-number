"use client";

import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { DatabaseRecord, DataEntrySchema, DataEntryFormValues } from "@/lib/schemas";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Edit, X, Loader2, Trash } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EditableDataRowProps {
  record: DatabaseRecord;
  tableName: string;
  onUpdate: () => void;
}

const numberFields: (keyof DataEntryFormValues)[] = [
  "date_number",
  "first_am_day",
  "second_am_day",
  "third_am_day",
  "first_pm_moon",
  "second_pm_moon",
  "third_pm_moon",
];

export function EditableDataRow({ record, tableName, onUpdate }: EditableDataRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: DataEntryFormValues = {
    complete_date: record.complete_date,
    date_number: record.date_number,
    first_am_day: record.first_am_day,
    second_am_day: record.second_am_day,
    third_am_day: record.third_am_day,
    first_pm_moon: record.first_pm_moon,
    second_pm_moon: record.second_pm_moon,
    third_pm_moon: record.third_pm_moon,
  };

  const form = useForm<DataEntryFormValues>({
    resolver: zodResolver(DataEntrySchema),
    defaultValues,
  });

  const handleEdit = () => {
    setIsEditing(true);
    // Reset form with current record data in case user cancelled previous edit
    form.reset(defaultValues);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.reset(defaultValues);
  };

  const onSubmit = async (values: DataEntryFormValues) => {
    setIsSubmitting(true);
    
    const payload = {
      ...values,
      // Ensure date is formatted correctly for DB update if it was changed
      complete_date: format(new Date(values.complete_date), "yyyy-MM-dd"),
    };

    const { error } = await supabase
      .from(tableName)
      .update(payload)
      .eq('id', record.id);

    if (error) {
      toast.error(`Update failed: ${error.message}`);
    } else {
      toast.success("Record updated successfully.");
      setIsEditing(false);
      onUpdate(); // Trigger parent component to re-fetch data
    }
    setIsSubmitting(false);
  };
  
  const handleDelete = async () => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', record.id);

    if (error) {
      toast.error(`Deletion failed: ${error.message}`);
    } else {
      toast.success("Record deleted successfully.");
      onUpdate(); // Trigger parent component to re-fetch data
    }
    setIsSubmitting(false);
  };

  const renderCell = (field: keyof DataEntryFormValues) => {
    const value = form.watch(field);
    
    if (isEditing) {
      return (
        <TableCell className="p-1">
          <Input
            type="number"
            {...form.register(field as keyof DataEntryFormValues, { valueAsNumber: true })}
            className="h-8 text-center p-1 text-sm"
            min={0}
            max={99}
          />
        </TableCell>
      );
    }
    
    return <TableCell>{value}</TableCell>;
  };

  return (
    <TableRow>
      <TableCell className="font-medium w-[120px]">
        {format(parseISO(record.complete_date), 'MMM dd, yyyy')}
      </TableCell>
      
      {/* Render editable/display cells for number fields */}
      {numberFields.map(field => (
        <React.Fragment key={field}>
          {renderCell(field)}
        </React.Fragment>
      ))}

      <TableCell className="text-right text-xs text-muted-foreground w-[100px]">
        {format(new Date(record.created_at), 'PP')}
      </TableCell>
      
      {/* Action Cell */}
      <TableCell className="w-[100px] text-right p-1">
        {isEditing ? (
          <div className="flex gap-1 justify-end">
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting}
              className="h-8 w-8"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4 text-green-500" />}
            </Button>
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={handleCancel}
              disabled={isSubmitting}
              className="h-8 w-8"
            >
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-1 justify-end">
            <Button size="icon" variant="ghost" onClick={handleEdit} className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the record for {format(parseISO(record.complete_date), 'MMM dd, yyyy')}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}