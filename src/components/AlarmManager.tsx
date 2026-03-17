"use client"

import { useState } from "react"
import { useHydration } from "@/lib/store"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Plus, Trash2, CalendarClock } from "lucide-react"

export function AlarmManager() {
  const { reminders, setReminders } = useHydration()
  const [time, setTime] = useState("")
  const [period, setPeriod] = useState("AM")

  const handleAddAlarm = () => {
    if (!time) return
    
    // Validate HH:MM format
    const timeRegex = /^([0-9]|0[0-9]|1[0-2]):[0-5][0-9]$/
    if (!timeRegex.test(time)) return

    // Ensure double digits for hours for consistent sorting
    const [hours, minutes] = time.split(':')
    const paddedHours = hours.padStart(2, '0')
    const formattedTime = `${paddedHours}:${minutes} ${period}`
    
    if (!reminders.includes(formattedTime)) {
      const newReminders = [...reminders, formattedTime].sort((a, b) => {
        return new Date(`2000/01/01 ${a}`).getTime() - new Date(`2000/01/01 ${b}`).getTime()
      })
      setReminders(newReminders)
    }
    setTime("")
  }

  const handleRemoveAlarm = (timeToRemove: string) => {
    setReminders(reminders.filter(t => t !== timeToRemove))
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-2xl">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white text-xl">
          <CalendarClock className="w-6 h-6 text-primary" /> Active Alarms
        </CardTitle>
        <CardDescription className="text-muted-foreground font-medium">
          Manage your daily hydration schedule manually.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-3 items-end p-4 bg-white/5 rounded-2xl border border-white/5">
          <div className="flex-1 space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">New Alarm Time</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="08:00"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-white/10 border-none text-white h-12 rounded-xl text-lg font-bold placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-primary/50"
              />
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-[90px] bg-white/10 border-none text-white h-12 rounded-xl font-bold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-white/10 text-white rounded-xl">
                  <SelectItem value="AM" className="focus:bg-primary focus:text-black">AM</SelectItem>
                  <SelectItem value="PM" className="focus:bg-primary focus:text-black">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button 
            onClick={handleAddAlarm}
            className="h-12 w-12 rounded-xl bg-primary text-background font-black hover:bg-primary/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          >
            <Plus className="w-6 h-6 stroke-[3px]" />
          </Button>
        </div>

        <div className="space-y-3">
          {reminders.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-[2rem] bg-white/[0.02]">
              <Clock className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground font-medium italic">No reminders scheduled.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {reminders.map((alarm) => (
                <div 
                  key={alarm} 
                  className="flex items-center justify-between p-4 bg-white/5 rounded-[1.25rem] border border-white/5 group hover:bg-white/10 hover:border-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="font-black text-white text-xl tracking-tight">{alarm}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-white/10 hover:text-destructive hover:bg-destructive/10 transition-all rounded-full h-10 w-10"
                    onClick={() => handleRemoveAlarm(alarm)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
