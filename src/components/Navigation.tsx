"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Droplet, History, Settings, Home } from "lucide-react"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "History", href: "/history", icon: History },
  { label: "Settings", href: "/settings", icon: Settings },
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-border flex justify-around items-center h-16 px-4 md:relative md:border-t-0 md:bg-transparent md:h-20">
      <div className="hidden md:flex items-center gap-2 mr-auto text-primary">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight">HydroTrack</span>
      </div>
      
      <div className="flex gap-8 md:gap-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-1 rounded-xl transition-colors md:flex-row md:gap-2",
                isActive ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="w-6 h-6 md:w-5 md:h-5" />
              <span className="text-[10px] md:text-sm font-semibold">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}