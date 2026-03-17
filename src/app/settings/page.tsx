
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useHydration } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, Droplets, Loader2 } from "lucide-react"

export default function SettingsPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { goal, setDailyGoal } = useHydration()

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
    <div className="space-y-8 max-w-lg mx-auto pb-10 text-white">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-muted-foreground font-medium">Manage your hydration targets and preferences.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 px-1">
            <Target className="w-5 h-5 text-primary" /> Hydration Goal
          </h3>
          <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="goal" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Daily Target (milliliters)</Label>
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                    <Input 
                      id="goal"
                      type="number" 
                      value={goal} 
                      onChange={(e) => setDailyGoal(Number(e.target.value))}
                      className="pl-10 h-12 text-lg font-bold bg-white/10 border-none rounded-xl text-white"
                    />
                  </div>
                  <div className="flex items-center px-4 bg-primary text-background rounded-xl font-bold">
                    ML
                  </div>
                </div>
                <p className="text-xs text-muted-foreground italic px-1">
                  Health experts recommend around 2500ml - 3000ml for active adults.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
