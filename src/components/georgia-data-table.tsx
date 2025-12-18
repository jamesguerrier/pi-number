import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GeorgiaDatabaseRecord } from "@/lib/schemas";
import { GeorgiaEditableDataRow } from "./georgia-editable-data-row";

interface GeorgiaDataTableProps {
  data: GeorgiaDatabaseRecord[];
  tableName: string;
  onUpdate: () => void;
}

export function GeorgiaDataTable({ data, tableName, onUpdate }: GeorgiaDataTableProps) {
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
            <TableHead className="text-right w-[100px]">Created At</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <GeorgiaEditableDataRow 
              key={record.id} 
              record={record} 
              tableName={tableName} 
              onUpdate={onUpdate} 
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}