"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { LogOut, LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { MobileNav } from "./mobile-nav"
import { useState } from "react"

export function MainNav() {
  const { session } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  
  const navItems = [
    { href: "/new-york", label: "New York" },
    { href: "/florida", label: "Florida" },
    { href: "/new-jersey", label: "New Jersey" },
    { href: "/georgia", label: "Georgia" },
    { href: "/verifier", label: "Verifier" },
  ]

  const handleSignOut = async () => {
    if (isSigningOut) return; // Prevent multiple clicks
    
    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error("Failed to sign out: " + error.message);
      } else {
        toast.success("Successfully signed out.");
      }
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("An error occurred during sign out.");
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Mobile Menu Trigger (Visible on small screens) */}
        <MobileNav /> 
        
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">
              PI-Number
            </span>
          </Link>
          
          {/* Desktop Navigation (Hidden on mobile) */}
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            {session && navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-primary text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex flex-1 items-center justify-end space-x-2">
          {session ? (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleSignOut} 
              title="Sign Out"
              disabled={isSigningOut}
            >
              <LogOut className="h-[1.2rem] w-[1.2rem]" />
              <span className="sr-only">Sign Out</span>
            </Button>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm" className="gap-1">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
              <Link href="/login?view=sign_up">
                <Button variant="default" size="sm" className="gap-1">
                  <UserPlus className="h-4 w-4" />
                  Sign Up
                </Button>
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}