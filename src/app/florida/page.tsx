import { NumberAnalysisForm } from "@/components/number-analysis-form";

export default function FloridaPage() {
  return (
    <div className="min-h-[calc(100vh-10rem)] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-background dark:to-gray-950">
      <NumberAnalysisForm location="Florida" />
    </div>
  );
}