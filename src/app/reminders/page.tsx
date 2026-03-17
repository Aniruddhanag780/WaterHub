"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { SmartReminderTool } from "@/components/SmartReminderTool"
import { AlarmManager } from "@/components/AlarmManager"
import { Bell, Sparkles, Loader2, Info } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function RemindersPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()

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

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" /> Hydration Hub
        </h1>
        <p className="text-muted-foreground font-medium">Control your schedule with AI or custom manual alarms.</p>
      </div>

      <div className="space-y-10">
        {/* Manual Alarm Management */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-primary/80">Manual Schedule</h3>
          </div>
          <AlarmManager />
        </section>

        {/* AI Suggestions */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-black uppercase tracking-[0.25em] text-primary/80">AI Optimization</h3>
          </div>
          <SmartReminderTool />
        </section>

        {/* Help/Info Footer */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden border-dashed">
          <CardContent className="p-6 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">How scheduling works</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Manually added alarms are persistent and repeat daily. Use the AI Optimization engine to automatically generate a spread of reminders that avoid your sleep cycle and peak activity windows.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
