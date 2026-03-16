"use client"

import { WaterProgress } from "@/components/WaterProgress"
import { WaterLogger } from "@/components/WaterLogger"
import { Card, CardContent } from "@/components/ui/card"
import { useHydration } from "@/lib/store"
import { Droplet, Trophy, Flame } from "lucide-react"

export default function Home() {
  const { logs, todayTotal, goal } = useHydration()
  
  // Basic streak calculation
  const streak = logs.length > 0 ? 5 : 0 // Placeholder logic

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Today's Intake</h1>
          <p className="text-muted-foreground font-medium">Keep moving, you're doing great!</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold border border-orange-200">
            <Flame className="w-4 h-4 fill-current" /> {streak}
          </div>
        </div>
      </div>

      <Card className="border-none shadow-xl shadow-primary/5 bg-white/50 backdrop-blur overflow-hidden">
        <CardContent className="p-0">
          <WaterProgress />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Goal</p>
              <p className="font-bold">{goal} ml</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-accent/10 text-accent rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Status</p>
              <p className="font-bold">{todayTotal >= goal ? "Achieved" : "Tracking"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold">Quick Log</h3>
        <WaterLogger />
      </div>
    </div>
  )
}