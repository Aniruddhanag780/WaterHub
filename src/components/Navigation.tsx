"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, History, Settings, Home, LogIn, LogOut, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useAuth } from "@/firebase"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "History", href: "/history", icon: History },
  { label: "AI Suggestion", href: "/reminders", icon: Sparkles },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()
  const auth = useAuth()

  const handleLogout = () => {
    signOut(auth)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-white/10 flex justify-around items-center h-16 px-4 md:relative md:border-t-0 md:bg-transparent md:h-20">
      <div className="hidden md:flex items-center gap-2 mr-auto text-primary">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">HydroTrack</span>
      </div>
      
      <div className="flex gap-2 md:gap-4 items-center">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1 rounded-xl transition-all md:flex-row md:gap-2",
                isActive ? "text-primary bg-primary/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]" : "text-muted-foreground hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-semibold">{item.label}</span>
            </Link>
          )
        })}

        <div className="h-8 w-[1px] bg-white/10 mx-2 hidden md:block" />

        {user ? (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl h-10 w-10"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        ) : (
          <Link href="/login">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-xl h-10 w-10"
              title="Sign In"
            >
              <LogIn className="w-5 h-5" />
            </Button>
          </Link>
        )}
      </div>
    </nav>
  )
}
