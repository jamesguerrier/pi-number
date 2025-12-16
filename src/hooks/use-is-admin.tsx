import { useAuth } from "@/context/auth-context";
import { ADMIN_EMAILS } from "@/lib/constants";

export function useIsAdmin(): boolean {
    const { user, isLoading } = useAuth();

    if (isLoading || !user) {
        return false;
    }

    // Check if the user's email is in the list of authorized admin emails
    return ADMIN_EMAILS.includes(user.email || "");
}