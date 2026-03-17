
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { SmartReminderTool } from "@/components/SmartReminderTool"
import { Bell, Sparkles, Loader2 } from "lucide-react"
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
    <div className="space-y-8 max-w-lg mx-auto pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
          <Bell className="w-8 h-8 text-primary" /> Smart Reminders
        </h1>
        <p className="text-muted-foreground font-medium">AI-powered hydration scheduling tailored to you.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5 text-primary" /> Optimization Engine
            </h3>
          </div>
          <SmartReminderTool />
        </section>

        <Card className="border-white/5 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
          <CardContent className="p-6">
            <h4 className="font-bold text-white mb-2">How it works</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Our AI analyzes your sleep cycle and daily activity patterns to suggest the most effective times for hydration. By avoiding peak activity and rest periods, we ensure reminders are helpful, not intrusive.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
