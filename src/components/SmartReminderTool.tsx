"use client"

import { useState } from "react"
import { useHydration } from "@/lib/store"
import { intelligentHydrationReminders, IntelligentHydrationRemindersOutput } from "@/ai/flows/intelligent-hydration-reminders"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles, Bell, Clock, Check } from "lucide-react"

export function SmartReminderTool() {
  const { goal, logs, setReminders } = useHydration()
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<IntelligentHydrationRemindersOutput | null>(null)
  const [applied, setApplied] = useState(false)
  
  const [schedule, setSchedule] = useState({
    wakeUpTime: "07:00",
    wakeUpPeriod: "AM",
    sleepTime: "10:00",
    sleepPeriod: "PM",
    activity: "Work from 9 to 5, gym in evening around 6 PM."
  })

  // Estimate average intake for the AI context
  const averageIntake = logs.length > 0 ? logs.reduce((acc, l) => acc + (l.amountMl ?? l.amount ?? 0), 0) / Math.max(1, (logs.length / 5)) : 1200

  const handleGetSuggestions = async () => {
    setLoading(true)
    setApplied(false)
    try {
      const result = await intelligentHydrationReminders({
        wakeUpTime: `${schedule.wakeUpTime} ${schedule.wakeUpPeriod}`,
        sleepTime: `${schedule.sleepTime} ${schedule.sleepPeriod}`,
        activityPattern: schedule.activity,
        dailyGoalMl: goal,
        averageIntakeMl: averageIntake
      })
      setSuggestion(result)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = () => {
    if (suggestion) {
      setReminders(suggestion.suggestedReminderTimes)
      setApplied(true)
      setTimeout(() => setApplied(false), 2000)
    }
  }

  return (
    <Card className="border-primary/20 bg-primary/5 rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" /> Smart Schedule
        </CardTitle>
        <CardDescription>
          Our AI analyzes your routine to find the best times to drink water.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Wake Up</Label>
            <div className="flex gap-2">
              <Input 
                type="text"
                placeholder="07:00"
                value={schedule.wakeUpTime} 
                onChange={e => setSchedule(s => ({...s, wakeUpTime: e.target.value}))}
                className="bg-white border-none shadow-sm text-black flex-1"
              />
              <Select 
                value={schedule.wakeUpPeriod} 
                onValueChange={value => setSchedule(s => ({...s, wakeUpPeriod: value}))}
              >
                <SelectTrigger className="w-[80px] bg-white border-none shadow-sm text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sleep Time</Label>
            <div className="flex gap-2">
              <Input 
                type="text"
                placeholder="10:00"
                value={schedule.sleepTime} 
                onChange={e => setSchedule(s => ({...s, sleepTime: e.target.value}))}
                className="bg-white border-none shadow-sm text-black flex-1"
              />
              <Select 
                value={schedule.sleepPeriod} 
                onValueChange={value => setSchedule(s => ({...s, sleepPeriod: value}))}
              >
                <SelectTrigger className="w-[80px] bg-white border-none shadow-sm text-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM">AM</SelectItem>
                  <SelectItem value="PM">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Typical Daily Activity</Label>
          <Textarea 
            placeholder="E.g. I work at a desk most day, workout at 6pm..."
            value={schedule.activity}
            onChange={e => setSchedule(s => ({...s, activity: e.target.value}))}
            className="bg-white border-none shadow-sm min-h-[100px] text-black"
          />
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90 rounded-xl h-12 text-base font-bold shadow-lg shadow-primary/20" 
          onClick={handleGetSuggestions}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
          Optimize Schedule
        </Button>

        {suggestion && (
          <div className="mt-6 p-5 rounded-2xl bg-white border border-primary/20 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold flex items-center gap-2 text-black">
                <Bell className="w-4 h-4 text-primary" /> Recommended Times
              </h4>
              <Button 
                size="sm" 
                variant={applied ? "default" : "outline"} 
                className={`rounded-full px-4 ${applied ? 'bg-emerald-500 hover:bg-emerald-600' : ''}`}
                onClick={handleApply}
              >
                {applied ? <><Check className="w-4 h-4 mr-1" /> Applied</> : "Apply Schedule"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestion.suggestedReminderTimes.map(time => (
                <span key={time} className="px-3 py-1 bg-primary/10 text-black rounded-lg text-sm font-bold flex items-center gap-1">
                  <Clock className="w-3 h-3 text-primary" /> {time}
                </span>
              ))}
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                &quot;{suggestion.explanation}&quot;
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
