"use client"

import { useHydration } from "@/lib/store"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Trash2, Calendar, Droplets, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HistoryPage() {
  const { logs, history, removeLog, goal } = useHydration()

  const sortedDates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  const sortedLogs = [...logs].sort((a, b) => b.timestamp - a.timestamp)

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight">Intake History</h1>
        <p className="text-muted-foreground font-medium">Review your hydration journey.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Daily Summaries
          </h3>
          <div className="grid gap-3">
            {sortedDates.length === 0 ? (
              <p className="text-muted-foreground italic p-8 text-center bg-card rounded-xl border-2 border-dashed">No data yet. Start drinking!</p>
            ) : (
              sortedDates.map((date) => {
                const amount = history[date]
                const achieved = amount >= goal
                return (
                  <Card key={date} className="border-none shadow-sm hover:shadow-md transition-all">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold">{date}</p>
                        <p className="text-xl font-bold text-primary">{amount} ml</p>
                      </div>
                      {achieved && (
                        <div className="bg-accent/10 text-accent px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider border border-accent/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Achieved
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Droplets className="w-5 h-5 text-primary" /> Recent Logs
          </h3>
          <div className="space-y-2">
            {sortedLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm group">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div>
                    <p className="font-bold">{log.amount} ml</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  onClick={() => removeLog(log.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}