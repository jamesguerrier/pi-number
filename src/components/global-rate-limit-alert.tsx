"use client";

import { useAuth } from "@/context/auth-context";
import { RateLimitAlert } from "@/components/ui/rate-limit-alert";
import { useEffect, useState } from "react";

export function GlobalRateLimitAlert() {
  const { rateLimitError, clearRateLimitError } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (rateLimitError) {
      setIsVisible(true);
      // Auto-hide after 10 seconds if user doesn't interact
      const timer = setTimeout(() => {
        setIsVisible(false);
        clearRateLimitError();
      }, 10000);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [rateLimitError, clearRateLimitError]);

  if (!isVisible || !rateLimitError) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 left-4 md:left-auto md:w-96 z-50 animate-in slide-in-from-top duration-300">
      <RateLimitAlert 
        message={rateLimitError}
        onRetry={() => {
          clearRateLimitError();
          window.location.reload();
        }}
      />
    </div>
  );
}