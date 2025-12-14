"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { LogIn, UserPlus } from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { UserAvatar } from "./user-avatar"

export function MainNav() {
  const { session } = useAuth();
  
  const navItems = [
    { href: "/new-york", label: "New York" },
    { href: "/florida", label: "Florida" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center max-w-6xl mx-auto px-4 md:px-8">
        <div className="mr-4 flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block text-xl">
              PI-Number
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
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
            <UserAvatar />
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