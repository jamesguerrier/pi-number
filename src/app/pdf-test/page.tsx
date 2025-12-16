"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PDFDownloadButton } from "@/components/pdf-download-button";
import { downloadAnalysisPDF } from "@/lib/pdf-utils";
import { toast } from "sonner";

export default function PDFTestPage() {
  const testAnalysisResult = {
    formattedFinalResults: ["45", "67 (2 times)", "89", "12"],
    mariagePairs: ["(24 x 45)", "(67 x 78)"],
    analysisSets: [
      {
        id: "lunMar-firstLM",
        inputIndices: [0, 1],
        matchingResult: {
          category: "lunMar",
          subCategory: "firstLM",
          days: {
            lundi: [7, 54],
            mardi: [55, 10, 70]
          }
        }
      }
    ],
    inputLabels: ["1er-AM", "2em-AM", "3em-AM", "1er-PM", "2em-PM", "3em-PM"],
    location: "New York",
    date: new Date(),
    inputNumbers: ["12", "34", "56", "78", "90", "23"]
  };

  const handleTestPDF = async () => {
    try {
      const success = await downloadAnalysisPDF(testAnalysisResult, "test-analysis.pdf");
      if (success) {
        toast.success("Test PDF downloaded!");
      }
    } catch (error) {
      toast.error("Failed to generate test PDF");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">PDF Download Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Analysis Data:</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <pre className="text-sm overflow-auto">
                {JSON.stringify(testAnalysisResult, null, 2)}
              </pre>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">PDF Download Options:</h3>
            <div className="flex flex-wrap gap-4">
              <PDFDownloadButton
                generatePDF={async () => {
                  const success = await downloadAnalysisPDF(testAnalysisResult, "test-analysis.pdf");
                  return success;
                }}
                variant="default"
              >
                Download Test PDF
              </PDFDownloadButton>

              <Button
                onClick={handleTestPDF}
                variant="outline"
              >
                Direct Download
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">How to use in your components:</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <code className="text-sm block whitespace-pre-wrap">
{`// 1. Import the PDF utilities
import { downloadAnalysisPDF } from "@/lib/pdf-utils";
import { PDFDownloadButton } from "@/components/pdf-download-button";

// 2. Create your analysis result object
const analysisResult = {
  formattedFinalResults: [...],
  mariagePairs: [...],
  analysisSets: [...],
  inputLabels: [...],
  location: "New York",
  date: new Date(),
  inputNumbers: [...]
};

// 3. Use the PDFDownloadButton component
<PDFDownloadButton
  generatePDF={async () => {
    return await downloadAnalysisPDF(analysisResult);
  }}
  variant="outline"
>
  Download Analysis PDF
</PDFDownloadButton>`}
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}