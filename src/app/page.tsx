
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
    // Basic string comparison for HH:MM AM/PM - in a real app we'd parse this properly
    return r > currentTimeStr
  }) || reminders[0]

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Today's Intake</h1>
          <p className="text-muted-foreground font-medium">Keep moving, you're doing great!</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-2xl text-sm font-bold border border-orange-200 shadow-sm transition-all hover:scale-105">
            <Flame className="w-5 h-5 fill-current" /> 
            <span className="text-base">{streak} day streak</span>
          </div>
        </div>
      </div>

      <Card className="border-none shadow-2xl shadow-primary/10 bg-white/50 backdrop-blur-xl overflow-hidden rounded-[2.5rem]">
        <CardContent className="p-0">
          <WaterProgress />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Goal</p>
              <p className="font-bold text-lg">{goal} ml</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-white rounded-2xl">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Status</p>
              <p className="font-bold text-lg">{todayTotal >= goal ? "Goal Met!" : "Hydrating"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {reminders.length > 0 && (
        <Card className="border-none bg-blue-50/50 rounded-2xl border border-blue-100/50">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 text-white rounded-full">
                <BellRing className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700">Next Reminder</p>
                <p className="font-bold text-blue-900">{nextReminder || "No more today"}</p>
              </div>
            </div>
            <div className="text-[10px] font-bold text-blue-400 uppercase tracking-tighter">AI Optimized</div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-1">Quick Log</h3>
        <WaterLogger />
      </div>
    </div>
  )
}
