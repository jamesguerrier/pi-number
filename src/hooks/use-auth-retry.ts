import { useState, useCallback } from 'react';

export function useAuthRetry(initialDelay = 30000) { // 30 seconds initial delay
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [lastErrorTime, setLastErrorTime] = useState<number | null>(null);

  const calculateDelay = useCallback((attempts: number) => {
    // Exponential backoff: 30s, 60s, 120s, 240s...
    return initialDelay * Math.pow(2, attempts);
  }, [initialDelay]);

  const canRetry = useCallback(() => {
    if (!lastErrorTime) return true;
    
    const delay = calculateDelay(retryCount);
    const timeSinceError = Date.now() - lastErrorTime;
    
    return timeSinceError >= delay;
  }, [lastErrorTime, retryCount, calculateDelay]);

  const getTimeUntilRetry = useCallback(() => {
    if (!lastErrorTime) return 0;
    
    const delay = calculateDelay(retryCount);
    const timeSinceError = Date.now() - lastErrorTime;
    const timeRemaining = Math.max(0, delay - timeSinceError);
    
    return Math.ceil(timeRemaining / 1000); // Return in seconds
  }, [lastErrorTime, retryCount, calculateDelay]);

  const recordError = useCallback(() => {
    setLastErrorTime(Date.now());
    setRetryCount(prev => prev + 1);
  }, []);

  const resetRetry = useCallback(() => {
    setRetryCount(0);
    setLastErrorTime(null);
    setIsRetrying(false);
  }, []);

  const startRetry = useCallback(async (retryFunction: () => Promise<any>) => {
    if (!canRetry()) {
      throw new Error(`Please wait ${getTimeUntilRetry()} seconds before retrying`);
    }

    setIsRetrying(true);
    try {
      const result = await retryFunction();
      resetRetry();
      return result;
    } catch (error) {
      setIsRetrying(false);
      throw error;
    }
  }, [canRetry, getTimeUntilRetry, resetRetry]);

  return {
    retryCount,
    isRetrying,
    canRetry,
    getTimeUntilRetry,
    recordError,
    resetRetry,
    startRetry,
  };
}