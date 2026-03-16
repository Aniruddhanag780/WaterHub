"use client"

import { useHydration } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Target, UserCircle, Droplets, ShieldCheck, Cloud, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { goal, setDailyGoal } = useHydration()
  const [isDriveConnected, setIsDriveConnected] = useState(false)

  const handleConnectDrive = () => {
    // In a production app, this would initiate OAuth2 flow with Drive scopes.
    // For the prototype, we simulate the connection state.
    setIsDriveConnected(true)
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-10 text-white">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Preferences</h1>
        <p className="text-muted-foreground font-medium">Personalize your HydroTrack experience.</p>
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

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 px-1">
            <UserCircle className="w-5 h-5 text-primary" /> Profile & Security
          </h3>
          <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
                  <UserCircle className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-white">HydroTrack Explorer</h4>
                  <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                    {isDriveConnected ? (
                      <>
                        <ShieldCheck className="w-3 h-3 text-emerald-400" /> Cloud Sync Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3 text-orange-400" /> Connect Google Drive for cloud sync
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex flex-col gap-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">External Backup</Label>
                  <div className="flex items-center justify-between bg-white/5 p-4 rounded-xl border border-white/5 group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                        <Cloud className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">Google Drive</p>
                        <p className="text-[10px] text-muted-foreground font-medium">Backup your hydration history</p>
                      </div>
                    </div>
                    <Button 
                      variant={isDriveConnected ? "ghost" : "outline"} 
                      size="sm" 
                      onClick={handleConnectDrive}
                      className={cn(
                        "rounded-lg border-white/10 h-8 px-4 font-bold text-xs",
                        isDriveConnected ? "text-emerald-400 cursor-default hover:bg-transparent" : "hover:bg-primary hover:text-black hover:border-primary"
                      )}
                    >
                      {isDriveConnected ? (
                        <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Connected</span>
                      ) : (
                        "Connect"
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}
