"use client";

import { AnalysisLog, AnalysisLogEntry, HistoricalHit } from "@/lib/schemas";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";

interface StepLogViewerProps {
    detailedLog: AnalysisLog;
}

export function StepLogViewer({ detailedLog }: StepLogViewerProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-1/2 gap-2">
                    <ListChecks className="h-4 w-4" />
                    View Step Log
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Detailed Analysis Log (5 Weeks)</DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="flex-grow p-4 border rounded-lg bg-background">
                    <div className="space-y-8">
                        {detailedLog.length === 0 ? (
                            <p className="text-center text-muted-foreground py-10">No analysis sets were generated from your input numbers.</p>
                        ) : (
                            detailedLog.map((entry, index) => (
                                <LogEntryTable key={index} entry={entry} />
                            ))
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}

interface LogEntryTableProps {
    entry: AnalysisLogEntry;
}

function LogEntryTable({ entry }: LogEntryTableProps) {
    const { inputLabel, inputNumber, analysisSetId, weekChecks } = entry;
    
    // Extract set info from ID (e.g., lunMar-firstLM)
    const setInfo = analysisSetId.split('-');
    const category = setInfo[0];
    const subCategory = setInfo[1];

    return (
        <div className="border rounded-lg shadow-sm">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 border-b">
                <h4 className="text-lg font-bold text-primary">
                    Input: <span className="text-foreground">{inputLabel} ({String(inputNumber).padStart(2, '0')})</span>
                </h4>
                <p className="text-sm text-muted-foreground">
                    Found in Data Set: {category} - {subCategory}
                </p>
            </div>
            
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Week</TableHead>
                        <TableHead className="w-[250px]">Dates Checked</TableHead>
                        <TableHead>Hits Found</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {weekChecks.map((check) => (
                        <TableRow key={check.week}>
                            <TableCell className="font-medium">Week {check.week}</TableCell>
                            <TableCell className="text-xs">
                                {format(new Date(check.date1), 'MMM dd, yyyy')} & {format(new Date(check.date2), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell>
                                {check.historicalHits.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {check.historicalHits.map((hit, i) => (
                                            <span 
                                                key={i} 
                                                className={cn(
                                                    "px-2 py-0.5 text-xs font-mono rounded",
                                                    hit.matchType === 'strict' 
                                                        ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                                                        : "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                                                )}
                                            >
                                                {String(hit.numberFound).padStart(2, '0')} ({hit.matchType})
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground italic text-sm">No match found this week.</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}