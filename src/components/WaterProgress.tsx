"use client"

import { useHydration } from "@/lib/store"
import { cn } from "@/lib/utils"
import { Droplets } from "lucide-react"

export function WaterProgress() {
  const { todayTotal, goal } = useHydration()
  const percentage = Math.min(Math.round((todayTotal / goal) * 100), 100)
  
  return (
    <div className="flex flex-col items-center justify-center p-8 relative">
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer Ring */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-muted"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={754}
            strokeDashoffset={754 - (754 * percentage) / 100}
            strokeLinecap="round"
            className="text-primary transition-all duration-1000 ease-in-out"
          />
        </svg>

        {/* Inner Glass Visual */}
        <div className="absolute inset-0 flex flex-center items-center justify-center">
          <div className="relative w-32 h-40 bg-white/20 border-2 border-primary/20 rounded-b-xl overflow-hidden glass-mask">
            <div 
              className="absolute bottom-0 left-0 w-full bg-primary/40 transition-all duration-1000 ease-out"
              style={{ height: `${percentage}%` }}
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-white/20 animate-pulse" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <Droplets className="w-8 h-8 text-primary mb-1 animate-bounce" />
              <span className="text-3xl font-bold tracking-tight">{percentage}%</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <h2 className="text-4xl font-bold text-foreground">
          {todayTotal} <span className="text-lg font-normal text-muted-foreground">/ {goal} ml</span>
        </h2>
        <p className="text-muted-foreground mt-2 font-medium">
          {percentage >= 100 ? "Goal achieved! Stay hydrated! 🥳" : `${goal - todayTotal}ml left to reach your goal`}
        </p>
      </div>
    </div>
  )
}