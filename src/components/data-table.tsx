import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DatabaseRecord } from "@/lib/schemas";
import { EditableDataRow } from "./editable-data-row";

interface DataTableProps {
  data: DatabaseRecord[];
  tableName: string;
  // Pass the fetch function down to trigger refresh after update
  onUpdate: () => void; 
}

export function DataTable({ data, tableName, onUpdate }: DataTableProps) {
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
            <TableHead className="text-right w-[100px]">Created At</TableHead>
            <TableHead className="text-right w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((record) => (
            <EditableDataRow 
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