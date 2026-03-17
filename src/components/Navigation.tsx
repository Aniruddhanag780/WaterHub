"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, History, Settings, Home, Sparkles, UserCircle, Bell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/firebase"

export function Navigation() {
  const pathname = usePathname()
  const { user } = useUser()

  // Don't show navigation on the login page
  if (pathname === "/login") return null

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "History", href: "/history", icon: History },
    { label: "Alarms", href: "/reminders", icon: Bell },
    { label: "AI Smart", href: "/ai-suggestions", icon: Sparkles },
    { label: "Account", href: "/account", icon: UserCircle },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-white/10 flex items-center h-20 px-2 md:relative md:border-t-0 md:bg-transparent md:h-24 md:px-0">
      {/* Desktop Logo - Hidden on Mobile */}
      <div className="hidden md:flex items-center gap-2 mr-auto text-primary group cursor-pointer">
        <div className="p-2.5 bg-primary/10 rounded-2xl transition-all group-hover:scale-110 group-hover:bg-primary/20">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <span className="text-2xl font-black tracking-tight text-white uppercase italic">WaterHub</span>
      </div>
      
      {/* Navigation Links - Perfect Distribution */}
      <div className="flex w-full justify-evenly items-center md:w-auto md:justify-end md:gap-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 px-1 py-2 rounded-2xl transition-all duration-300 md:flex-row md:gap-3 md:px-5 h-14 md:h-12 min-w-[60px]",
                isActive 
                  ? "text-primary bg-primary/10 shadow-[0_0_25px_rgba(0,229,255,0.15)] ring-1 ring-primary/20" 
                  : "text-muted-foreground hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className={cn("w-5 h-5 md:w-5 md:h-5 transition-transform", isActive && "scale-110")} />
              <span className="text-[9px] md:text-sm font-bold uppercase tracking-wider">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
