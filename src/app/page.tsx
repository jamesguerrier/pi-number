"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function Home() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [numbers, setNumbers] = useState<string[]>(["", "", "", "", "", ""]);

  const handleNumberChange = (index: number, value: string) => {
    // Only allow numbers and limit to 2 digits
    const numericValue = value.replace(/\D/g, "").slice(0, 2);
    
    const newNumbers = [...numbers];
    newNumbers[index] = numericValue;
    setNumbers(newNumbers);
  };

  const handleNext = () => {
    console.log("Date:", date);
    console.log("Numbers:", numbers);
    // You can add your next step logic here
    alert(`Date: ${date ? format(date, "yyyy-MM-dd") : "Not selected"}\nNumbers: ${numbers.join(", ")}`);
  };

  // Define the labels for the inputs
  const inputLabels = [
    "1er-AM",
    "2em-AM", 
    "3em-AM",
    "1er-PM",
    "2em-PM",
    "3em-PM"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8 flex items-center justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">Number Input App</CardTitle>
          <CardDescription className="text-gray-600">
            Enter a date and six 2-digit numbers to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Date Input Section */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">Select Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Number Inputs Section */}
          <div className="space-y-6">
            <label className="text-sm font-medium text-gray-700">Enter Six 2-Digit Numbers</label>
            
            {/* First set of 3 inputs (AM) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs text-gray-500">{inputLabels[index]}</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="00"
                    value={numbers[index]}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    className="text-center text-2xl font-bold h-14"
                    maxLength={2}
                  />
                </div>
              ))}
            </div>

            {/* Second set of 3 inputs (PM) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[3, 4, 5].map((index) => (
                <div key={index} className="space-y-2">
                  <label className="text-xs text-gray-500">{inputLabels[index]}</label>
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="00"
                    value={numbers[index]}
                    onChange={(e) => handleNumberChange(index, e.target.value)}
                    className="text-center text-2xl font-bold h-14"
                    maxLength={2}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-4">
            <Button 
              onClick={handleNext}
              className="w-full h-12 text-lg font-semibold"
              size="lg"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}