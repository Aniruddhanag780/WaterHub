"use client"

import { useState } from "react"
import { useHydration } from "@/lib/store"
import { intelligentHydrationReminders, IntelligentHydrationRemindersOutput } from "@/ai/flows/intelligent-hydration-reminders"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, Bell, Clock } from "lucide-react"

export function SmartReminderTool() {
  const { goal, logs } = useHydration()
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<IntelligentHydrationRemindersOutput | null>(null)
  
  const [schedule, setSchedule] = useState({
    wakeUp: "07:00 AM",
    sleep: "10:00 PM",
    activity: "Work from 9 to 5, gym in evening around 6 PM."
  })

  const averageIntake = logs.length > 0 ? logs.reduce((acc, l) => acc + l.amount, 0) / Math.max(1, (logs.length / 5)) : 1200 // Mock calc

  const handleGetSuggestions = async () => {
    setLoading(true)
    try {
      const result = await intelligentHydrationReminders({
        wakeUpTime: schedule.wakeUp,
        sleepTime: schedule.sleep,
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

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Sparkles className="w-5 h-5" /> Smart Schedule
        </CardTitle>
        <CardDescription>
          Our AI analyzes your routine to find the best times to drink water.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Wake Up</Label>
            <Input 
              value={schedule.wakeUp} 
              onChange={e => setSchedule(s => ({...s, wakeUp: e.target.value}))}
            />
          </div>
          <div className="space-y-2">
            <Label>Sleep Time</Label>
            <Input 
              value={schedule.sleep} 
              onChange={e => setSchedule(s => ({...s, sleep: e.target.value}))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Typical Daily Activity</Label>
          <Textarea 
            placeholder="E.g. I work at a desk most day, workout at 6pm..."
            value={schedule.activity}
            onChange={e => setSchedule(s => ({...s, activity: e.target.value}))}
          />
        </div>
        
        <Button 
          className="w-full bg-primary hover:bg-primary/90" 
          onClick={handleGetSuggestions}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
          Optimize Schedule
        </Button>

        {suggestion && (
          <div className="mt-6 p-4 rounded-lg bg-white border border-primary/20 animate-in fade-in slide-in-from-top-4">
            <h4 className="font-bold flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-primary" /> Recommended Times
            </h4>
            <div className="flex flex-wrap gap-2 mb-4">
              {suggestion.suggestedReminderTimes.map(time => (
                <span key={time} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {time}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed italic">
              &quot;{suggestion.explanation}&quot;
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}