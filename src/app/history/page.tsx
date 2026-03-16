"use client"

import { useHydration } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Calendar, Droplets, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HistoryPage() {
  const { logs, history, removeLog, goal } = useHydration()

  const sortedDates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  const sortedLogs = [...logs].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime()
    const timeB = new Date(b.timestamp).getTime()
    return timeB - timeA
  })

  return (
    <div className="space-y-8 max-w-lg mx-auto">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Intake History</h1>
        <p className="text-muted-foreground font-medium">Review your hydration journey.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Calendar className="w-5 h-5 text-primary" /> Daily Summaries
          </h3>
          <div className="grid gap-3">
            {sortedDates.length === 0 ? (
              <p className="text-muted-foreground italic p-8 text-center bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                No data yet. Start drinking!
              </p>
            ) : (
              sortedDates.map((date) => {
                const totalAmount = history[date]
                const achieved = totalAmount >= goal
                return (
                  <Card key={date} className="border-white/10 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{date}</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-2xl font-black text-primary">{totalAmount}</p>
                          <p className="text-xs font-bold text-primary/60">ml total</p>
                        </div>
                      </div>
                      {achieved && (
                        <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Goal Met
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
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Droplets className="w-5 h-5 text-primary" /> Recent Logs
          </h3>
          <div className="space-y-3">
            {sortedLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-4 italic">No recent logs found.</p>
            ) : (
              sortedLogs.map((log) => {
                const amount = log.amountMl ?? log.amount ?? 0
                return (
                  <div key={log.id} className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-2xl group hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <p className="text-lg font-black text-white">{amount}</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">ml</p>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white/20 hover:text-destructive hover:bg-destructive/10 transition-all rounded-full"
                      onClick={() => removeLog(log.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
