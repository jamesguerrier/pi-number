import { AuthApiError } from '@supabase/supabase-js';
import { toast } from 'sonner';

export function isRateLimitError(error: any): boolean {
  return error instanceof AuthApiError && 
    (error.status === 429 || 
     error.message?.includes('rate limit') || 
     error.message?.includes('too many requests'));
}

export function handleAuthError(error: any, customMessage?: string): string {
  console.error('Auth error:', error);
  
  if (isRateLimitError(error)) {
    const message = 'Too many requests. Please wait 30-60 seconds before trying again.';
    toast.error(message);
    return message;
  }
  
  if (error instanceof AuthApiError) {
    let message = customMessage || 'Authentication failed';
    
    // Provide more specific error messages for common cases
    switch (error.status) {
      case 400:
        if (error.message.includes('Invalid login credentials')) {
          message = 'Invalid email or password';
        } else if (error.message.includes('Email not confirmed')) {
          message = 'Please confirm your email address before signing in';
        }
        break;
      case 401:
        message = 'Session expired. Please sign in again.';
        break;
      case 422:
        message = 'Invalid input. Please check your information.';
        break;
      case 500:
        message = 'Server error. Please try again later.';
        break;
    }
    
    toast.error(message);
    return message;
  }
  
  // Generic error
  const message = customMessage || 'An unexpected error occurred';
  toast.error(message);
  return message;
}

export function getRetryDelayMessage(seconds: number): string {
  if (seconds <= 0) return 'Ready to retry';
  if (seconds < 60) return `Please wait ${seconds} second${seconds !== 1 ? 's' : ''}`;
  
  const minutes = Math.ceil(seconds / 60);
  return `Please wait ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}