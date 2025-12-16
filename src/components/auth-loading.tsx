import { Loader2 } from "lucide-react";

interface AuthLoadingProps {
  message?: string;
}

export function AuthLoading({ message = "Loading..." }: AuthLoadingProps) {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}