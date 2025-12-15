import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatabaseRecord } from "@/lib/schemas";
import { format, parseISO } from "date-fns";

interface DataTableProps {
  data: DatabaseRecord[];
  tableName: string;
}

export function DataTable({ data, tableName }: DataTableProps) {
  if (data.length === 0) {
    return <p className="text-center text-muted-foreground py-8">No data records found for {tableName}.</p>;
  }

  return (
    <div className="overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Date</TableHead>
            <TableHead>Date #</TableHead>
            <TableHead>1st AM</TableHead>
            <TableHead>2nd AM</TableHead>
            <TableHead>3rd AM</TableHead>
            <TableHead>1st PM</TableHead>
            <TableHead>2nd PM</TableHead>
            <TableHead>3rd PM</TableHead>
            <TableHead className="text-right">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{format(parseISO(record.complete_date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{record.date_number}</TableCell>
              <TableCell>{record.first_am_day}</TableCell>
              <TableCell>{record.second_am_day}</TableCell>
              <TableCell>{record.third_am_day}</TableCell>
              <TableCell>{record.first_pm_moon}</TableCell>
              <TableCell>{record.second_pm_moon}</TableCell>
              <TableCell>{record.third_pm_moon}</TableCell>
              <TableCell className="text-right text-xs text-muted-foreground">
                {format(new Date(record.created_at), 'PP')}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}