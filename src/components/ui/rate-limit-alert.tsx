import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RateLimitAlertProps {
  message?: string;
  onRetry?: () => void;
  retryDisabled?: boolean;
}

export function RateLimitAlert({ 
  message = "Too many requests. Please wait a moment before trying again.", 
  onRetry,
  retryDisabled = false 
}: RateLimitAlertProps) {
  return (
    <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="text-red-800 dark:text-red-300">Rate Limit Exceeded</AlertTitle>
      <AlertDescription className="text-red-700 dark:text-red-400 mt-2">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <p>{message}</p>
            <p className="text-sm">
              This usually happens when you try to sign in too many times in a short period.
              Please wait 30-60 seconds before trying again.
            </p>
            {onRetry && (
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onRetry}
                  disabled={retryDisabled}
                  className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/30"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}