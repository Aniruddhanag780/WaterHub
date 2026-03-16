"use client"

import { WaterProgress } from "@/components/WaterProgress"
import { WaterLogger } from "@/components/WaterLogger"
import { Card, CardContent } from "@/components/ui/card"
import { useHydration } from "@/lib/store"
import { Droplet, Trophy, Flame, BellRing } from "lucide-react"

export default function Home() {
  const { todayTotal, goal, streak, reminders } = useHydration()
  
  // Find next reminder
  const now = new Date()
  const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  const nextReminder = reminders.find(r => {
    return r > currentTimeStr
  }) || reminders[0]

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Today's Intake</h1>
          <p className="text-muted-foreground font-medium">Keep moving, you're doing great!</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-2xl text-sm font-bold border border-primary/20 shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all hover:scale-105">
            <Flame className="w-5 h-5 fill-current" /> 
            <span className="text-base">{streak} day streak</span>
          </div>
        </div>
      </div>

      <Card className="border-white/10 shadow-2xl bg-white/5 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-0">
          <WaterProgress />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-white/5 bg-white/5 backdrop-blur-md rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/20 text-primary rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Goal</p>
              <p className="font-bold text-lg text-white">{goal} ml</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/5 backdrop-blur-md rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Status</p>
              <p className="font-bold text-lg text-white">{todayTotal >= goal ? "Goal Met!" : "Hydrating"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {reminders.length > 0 && (
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-sm rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary text-background rounded-full">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-primary/80">Next Reminder</p>
                <p className="font-bold text-white">{nextReminder || "No more today"}</p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-primary/50 uppercase tracking-tighter">AI Optimized</div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-1 text-white">Quick Log</h3>
        <WaterLogger />
      </div>
    </div>
  )
}