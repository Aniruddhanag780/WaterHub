"use client"

import { useHydration } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Droplets } from "lucide-react"

export function WaterProgress() {
  const { todayTotal, goal } = useHydration()
  const percentage = Math.min(Math.round((todayTotal / goal) * 100), 100)
  
  // Radius is 120, circumference is 2 * PI * r = ~753.98
  const circumference = 754
  const offset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-8 relative">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer Ring */}
        <svg 
          className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,229,255,0.2)]" 
          viewBox="0 0 256 256"
        >
          {/* Background Track - Increased visibility */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-white/10"
          />
          {/* Progress Path */}
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-in-out"
          />
        </svg>

        {/* Inner Glass Visual */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-32 h-40 bg-white/5 border-2 border-white/10 rounded-b-xl overflow-hidden glass-mask backdrop-blur-sm shadow-inner">
            <div 
              className="absolute bottom-0 left-0 w-full bg-primary/30 transition-all duration-1000 ease-out"
              style={{ height: `${percentage}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/40 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
              <Droplets className={cn(
                "w-8 h-8 mb-1 transition-all duration-500",
                percentage > 0 ? "text-primary animate-bounce" : "text-white/20"
              )} />
              <span className="text-3xl font-black tracking-tighter text-white">
                {percentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-4xl font-black tracking-tight text-white">
          {todayTotal} <span className="text-lg font-bold text-muted-foreground">/ {goal} ml</span>
        </h2>
        <p className="text-sm text-muted-foreground font-medium max-w-[200px] mx-auto leading-tight">
          {percentage >= 100 
            ? "Hydration goal reached! Excellent work. 🥳" 
            : `${goal - todayTotal}ml more to reach your daily target`}
        </p>
      </div>
    </div>
  )
}
