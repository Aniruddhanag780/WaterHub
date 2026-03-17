
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, History, Settings, Home, Sparkles, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/firebase"

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "History", href: "/history", icon: History },
  { label: "AI Suggestion", href: "/reminders", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()

  // Don't show navigation on the login page
  if (pathname === "/login") return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-white/10 flex items-center h-16 px-2 md:relative md:border-t-0 md:bg-transparent md:h-20 md:px-0">
      {/* Desktop Logo - Hidden on Mobile */}
      <div className="hidden md:flex items-center gap-2 mr-auto text-primary">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">HydroTrack</span>
      </div>
      
      {/* Navigation Links - Centered/Distributed on Mobile, Right-aligned on Desktop */}
      <div className="flex w-full justify-around items-center md:w-auto md:justify-end md:gap-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all md:flex-row md:gap-2 md:px-4 h-12 md:h-10",
                isActive ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]" : "text-muted-foreground hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] md:text-sm font-semibold">{item.label}</span>
            </Link>
          )
        })}

        {user && (
          <>
            <div className="h-8 w-[1px] bg-white/10 mx-1 hidden md:block" />
            <Link 
              href="/settings" 
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-xl transition-all md:flex-row md:gap-2 md:px-4 h-12 md:h-10",
                pathname === "/settings" ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]" : "text-muted-foreground hover:text-white"
              )}
            >
              <UserCircle className="w-5 h-5" />
              <span className="text-[10px] md:text-sm font-semibold">Account</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
