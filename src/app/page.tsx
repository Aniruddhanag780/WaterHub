
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { WaterProgress } from "@/components/WaterProgress"
import { WaterLogger } from "@/components/WaterLogger"
import { Card, CardContent } from "@/components/ui/card"
import { useHydration } from "@/lib/store"
import { Droplet, Trophy, Flame, BellRing, Loader2, Bell, CheckCircle2, XCircle, Clock } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function Home() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { todayTotal, goal, streak, reminders, notifications } = useHydration()
  
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  // Find next reminder
  const now = new Date()
  const currentTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
  const nextReminder = reminders.find(r => {
    return r > currentTimeStr
  }) || reminders[0]

  // Filter today's notifications
  const today = new Date().toLocaleDateString()
  const todayNotifications = notifications.filter(n => new Date(n.timestamp).toLocaleDateString() === today)

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Today's Intake</h1>
          <p className="text-muted-foreground font-medium">Keep moving, you're doing great!</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 group h-12 w-12 transition-all">
                <Bell className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                {todayNotifications.length > 0 && (
                  <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-3xl border-white/10 bg-card/95 backdrop-blur-xl shadow-2xl mr-4" align="end">
              <div className="p-4 border-b border-white/5">
                <h3 className="font-bold text-lg text-white">System Activities</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Done Today</p>
              </div>
              <ScrollArea className="max-h-[350px]">
                <div className="p-2 space-y-1">
                  {todayNotifications.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center">
                        <Bell className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm text-muted-foreground italic">No system activity logged today.</p>
                    </div>
                  ) : (
                    todayNotifications.map((notif) => (
                      <div key={notif.id} className="p-3 rounded-2xl hover:bg-white/5 flex gap-3 group transition-colors">
                        <div className={notif.status === 'completed' ? "text-primary" : "text-destructive"}>
                          {notif.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{notif.title}</p>
                          <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            <span className={notif.status === 'completed' ? "text-emerald-500/80" : "text-destructive/80"}>
                              • {notif.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-white/5">
                <p className="text-[9px] text-center text-muted-foreground font-medium italic">
                  Water logs are excluded from this activity feed.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 h-12 rounded-2xl text-sm font-bold border border-primary/20 shadow-[0_0_20px_rgba(0,229,255,0.1)] transition-all hover:scale-105">
            <Flame className="w-5 h-5 fill-current" /> 
            <span className="text-base">{streak}d</span>
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
