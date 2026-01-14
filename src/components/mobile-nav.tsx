"use client"

import * as React from "react"
import Link, { LinkProps } from "next/link"
import { useRouter } from "next/navigation"
import { Menu } from "lucide-react"

import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"

const navItems = [
    { href: "/new-york", label: "New York" },
    { href: "/florida", label: "Florida" },
    { href: "/new-jersey", label: "New Jersey" },
    { href: "/georgia", label: "Georgia" },
    { href: "/verifier", label: "Verifier" },
    { href: "/day-checker", label: "Day Checker" }, // Added new link
]

interface MobileLinkProps extends LinkProps {
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
  className?: string
}

function MobileLink({
  href,
  onOpenChange,
  className,
  children,
  ...props
}: MobileLinkProps) {
  const router = useRouter()
  return (
    <Link
      href={href}
      onClick={() => {
        router.push(href.toString())
        onOpenChange?.(false)
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Link>
  )
}

export function MobileNav() {
  const [open, setOpen] = React.useState(false)
  const { session } = useAuth();

  if (!session) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        {/* Added SheetTitle to resolve accessibility warning */}
        <SheetTitle className="sr-only">Main Navigation Menu</SheetTitle>
        <MobileLink
          href="/"
          className="flex items-center space-x-2 pt-4 pb-6 px-6"
          onOpenChange={setOpen}
        >
          <span className="font-bold text-xl">PI-Number</span>
        </MobileLink>
        <div className="flex flex-col space-y-3 px-6">
          {navItems.map((item) => (
            <MobileLink
              key={item.href}
              href={item.href}
              onOpenChange={setOpen}
              className="text-lg font-medium transition-colors hover:text-primary"
            >
              {item.label}
            </MobileLink>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}