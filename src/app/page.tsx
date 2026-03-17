
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { WaterProgress } from "@/components/WaterProgress"
import { WaterLogger } from "@/components/WaterLogger"
import { Card, CardContent } from "@/components/ui/card"
import { useHydration } from "@/lib/store"
import { Droplet, Trophy, Flame, BellRing, Loader2, Bell, CheckCircle2, XCircle, Clock, Volume2, ShieldAlert, Cloud, Trash2 } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function Home() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { todayTotal, goal, streak, reminders, notifications, currentDate, isRinging, stopAlarm } = useHydration()
  
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

  const now = new Date()
  const nextReminder = reminders.find(r => {
    const reminderTime = new Date(`2000/01/01 ${r}`)
    const nowTime = new Date(`2000/01/01 ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`)
    return reminderTime > nowTime
  }) || (reminders.length > 0 ? "Done for today" : null)

  const todayNotifications = notifications.filter(n => {
    if (!currentDate) return false
    return new Date(n.timestamp).toLocaleDateString() === currentDate
  })

  const getIconForType = (type: string) => {
    switch (type) {
      case 'drive_sync':
      case 'drive_connected':
      case 'drive_disconnected':
        return <Cloud className="w-4 h-4" />
      case 'water_added':
        return <Droplet className="w-4 h-4" />
      case 'water_removed':
        return <Trash2 className="w-4 h-4" />
      case 'goal_updated':
        return <Trophy className="w-4 h-4" />
      case 'reminders_updated':
      case 'hydration_reminder':
        return <Bell className="w-4 h-4" />
      default:
        return <CheckCircle2 className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      {/* Persistent Alarm Ringing UI */}
      {isRinging && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md animate-in slide-in-from-top-full duration-500">
          <Card className="bg-destructive border-white/20 shadow-[0_0_50px_rgba(239,68,68,0.5)] overflow-hidden rounded-[2rem]">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                  <Volume2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg leading-tight">Hydration Alarm!</h3>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider">Logging water silences beep</p>
                </div>
              </div>
              <Button 
                onClick={stopAlarm}
                className="bg-white text-destructive hover:bg-white/90 font-black rounded-xl px-6 h-12 shadow-lg transition-all active:scale-95"
              >
                SILENCE
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

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
                <h3 className="font-bold text-lg text-white">Activity Feed</h3>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Everything you perform</p>
              </div>
              <ScrollArea className="max-h-[350px]">
                <div className="p-2 space-y-1">
                  {todayNotifications.length === 0 ? (
                    <div className="py-10 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center">
                        <Bell className="w-6 h-6 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm text-muted-foreground italic">No activity logged today yet.</p>
                    </div>
                  ) : (
                    todayNotifications.map((notif) => (
                      <div key={notif.id} className="p-3 rounded-2xl hover:bg-white/5 flex gap-3 group transition-colors">
                        <div className={cn(
                          "shrink-0 p-1.5 rounded-lg flex items-center justify-center",
                          notif.status === 'completed' ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
                        )}>
                          {getIconForType(notif.type)}
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
                  Showing your real-time actions and system updates.
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

      <Card 
        className={cn(
          "border-2 transition-all duration-300 rounded-[2rem] overflow-hidden",
          reminders.length > 0 
            ? "border-primary/20 bg-primary/5 shadow-[0_0_30px_rgba(0,229,255,0.05)]" 
            : "border-white/5 bg-white/5 border-dashed"
        )}
      >
        <CardContent className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
              reminders.length > 0 ? "bg-primary text-background" : "bg-white/10 text-white/40"
            )}>
              <BellRing className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Hydration Alarm</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-black text-white">
                  {nextReminder || "No Alarms Set"}
                </p>
                {reminders.length > 0 && nextReminder !== "Done for today" && (
                  <span className="text-[10px] font-bold text-primary animate-pulse">LIVE</span>
                )}
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => router.push('/reminders')}
            className="rounded-xl border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all px-4 h-9"
          >
            {reminders.length > 0 ? "Manage" : "Configure"}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-1 text-white flex items-center justify-between">
          Quick Log
          {isRinging && (
            <span className="flex items-center gap-1 text-[10px] text-destructive animate-pulse">
              <ShieldAlert className="w-3 h-3" /> Log to silence alarm
            </span>
          )}
        </h3>
        <WaterLogger />
      </div>
    </div>
  )
}
