
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { SmartReminderTool } from "@/components/SmartReminderTool"
import { Sparkles, Loader2, Info, Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AISuggestionsPage() {
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
          <Sparkles className="w-8 h-8 text-primary" /> AI Optimizer
        </h1>
        <p className="text-muted-foreground font-medium">Let intelligence handle your hydration frequency.</p>
      </div>

      <div className="space-y-10">
        {/* AI Suggestions Tool */}
        <section className="space-y-4">
          <SmartReminderTool />
        </section>

        {/* Manual Alarm Shortcut Card */}
        <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden border-dashed">
          <CardContent className="p-6 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <Bell className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-white text-sm">Prefer manual control?</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  You can always set custom one-off or recurring alarms manually in your reminders hub.
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              className="w-full border-white/10 hover:bg-white/5 text-white font-bold rounded-xl"
              onClick={() => router.push('/reminders')}
            >
              Manage Manual Alarms
            </Button>
          </CardContent>
        </Card>

        {/* AI Explanation Footer */}
        <Card className="border-white/5 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden">
          <CardContent className="p-6 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-sm">How AI Scheduling Works</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our model considers your wake/sleep cycle to prevent disruptive alerts. It spreads your goal volume across 6-8 reminders, specifically avoiding times you marked as "Busy" in your activity description.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
