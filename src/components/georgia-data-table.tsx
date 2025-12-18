import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GeorgiaDatabaseRecord } from "@/lib/schemas";
import { format, parseISO } from "date-fns";

interface GeorgiaDataTableProps {
  data: GeorgiaDatabaseRecord[];
  tableName: string;
}

export function GeorgiaDataTable({ data, tableName }: GeorgiaDataTableProps) {
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
            {/* Day */}
            <TableHead>1st Day</TableHead>
            <TableHead>2nd Day</TableHead>
            <TableHead>3rd Day</TableHead>
            {/* Moon */}
            <TableHead>1st Moon</TableHead>
            <TableHead>2nd Moon</TableHead>
            <TableHead>3rd Moon</TableHead>
            {/* Night */}
            <TableHead>1st Night</TableHead>
            <TableHead>2nd Night</TableHead>
            <TableHead>3rd Night</TableHead>
            <TableHead className="text-right">Created At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium">{format(parseISO(record.complete_date), 'MMM dd, yyyy')}</TableCell>
              <TableCell>{record.date_number}</TableCell>
              {/* Day */}
              <TableCell>{record.first_day}</TableCell>
              <TableCell>{record.second_day}</TableCell>
              <TableCell>{record.third_day}</TableCell>
              {/* Moon */}
              <TableCell>{record.first_moon}</TableCell>
              <TableCell>{record.second_moon}</TableCell>
              <TableCell>{record.third_moon}</TableCell>
              {/* Night */}
              <TableCell>{record.first_night}</TableCell>
              <TableCell>{record.second_night}</TableCell>
              <TableCell>{record.third_night}</TableCell>
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