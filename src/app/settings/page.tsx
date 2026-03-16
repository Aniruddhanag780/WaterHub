"use client"

import { useHydration } from "@/lib/store"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmartReminderTool } from "@/components/SmartReminderTool"
import { Target, Bell, UserCircle } from "lucide-react"

export default function SettingsPage() {
  const { goal, setDailyGoal } = useHydration()

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground font-medium">Personalize your HydroTrack experience.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" /> Hydration Goal
          </h3>
          <Card className="border-none shadow-md">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal">Daily Target (milliliters)</Label>
                <div className="flex gap-4">
                  <Input 
                    id="goal"
                    type="number" 
                    value={goal} 
                    onChange={(e) => setDailyGoal(Number(e.target.value))}
                    className="flex-1"
                  />
                  <div className="flex items-center px-4 bg-muted rounded-md font-bold text-muted-foreground">
                    ML
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic">
                  Health experts recommend around 2500ml - 3000ml for active adults.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" /> Reminders
          </h3>
          <SmartReminderTool />
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-primary" /> Profile
          </h3>
          <Card className="border-none shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                  <UserCircle className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg">HydroTrack User</h4>
                  <p className="text-sm text-muted-foreground">Free Member</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}