
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useHydration } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Calendar, Droplets, CheckCircle2, XCircle, ChevronDown, ChevronUp, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { logs, history, removeLog, goal, dailySummaries } = useHydration()
  const [showAll, setShowAll] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

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

  // We prioritize dailySummaries from Firestore if they exist, otherwise fall back to calculated history
  const allDates = Array.from(new Set([...Object.keys(history), ...dailySummaries.map(s => s.date)]))
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  const displayedDates = showAll ? allDates : allDates.slice(0, 4)

  const filteredLogs = [...logs]
    .filter(log => {
      if (!selectedDate) return false // Don't show logs in recent view if we want "Summary -> Detail"
      const logDate = log.timestamp ? new Date(log.timestamp).toLocaleDateString() : ""
      return logDate === selectedDate
    })
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Intake History</h1>
        <p className="text-muted-foreground font-medium">Review your hydration journey and goal completion.</p>
      </div>

      <div className="space-y-6">
        {!selectedDate ? (
          <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-bold flex items-center gap-2 text-white">
                <Calendar className="w-5 h-5 text-primary" /> Daily Summaries
              </h3>
            </div>
            
            <div className="grid gap-3">
              {allDates.length === 0 ? (
                <p className="text-muted-foreground italic p-8 text-center bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                  No data yet. Start drinking!
                </p>
              ) : (
                <>
                  {displayedDates.map((date) => {
                    const summary = dailySummaries.find(s => s.date === date)
                    const totalAmount = summary ? summary.totalAmountMl : (history[date] || 0)
                    const currentGoal = summary ? summary.goalMl : goal
                    const achieved = totalAmount >= currentGoal
                    
                    return (
                      <Card 
                        key={date} 
                        className="border-white/10 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl transition-all cursor-pointer hover:bg-white/10 active:scale-[0.98] group"
                        onClick={() => setSelectedDate(date)}
                      >
                        <CardContent className="p-5 flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{date}</p>
                            <div className="flex items-baseline gap-1">
                              <p className="text-2xl font-black text-primary group-hover:scale-105 transition-transform">{totalAmount}</p>
                              <p className="text-xs font-bold text-primary/60">/ {currentGoal} ml</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {achieved ? (
                              <div className="bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Goal Met
                              </div>
                            ) : (
                              <div className="bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider border border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                                <XCircle className="w-3.5 h-3.5" /> Incomplete
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}

                  {allDates.length > 4 && (
                    <Button 
                      variant="ghost" 
                      className="w-full text-muted-foreground hover:text-white mt-2 font-bold py-6 bg-white/5 rounded-2xl border border-white/5"
                      onClick={() => setShowAll(!showAll)}
                    >
                      {showAll ? (
                        <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                      ) : (
                        <><ChevronDown className="w-4 h-4 mr-2" /> See More ({allDates.length - 4} more)</>
                      )}
                    </Button>
                  )}
                </>
              )}
            </div>
          </section>
        ) : (
          <section className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl border-white/10 bg-white/5 h-10 w-10 text-white"
                onClick={() => setSelectedDate(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="space-y-0.5">
                <h3 className="text-xl font-bold text-white">{selectedDate}</h3>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Daily Log Details</p>
              </div>
            </div>

            <div className="space-y-3">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-20 space-y-4 bg-white/5 rounded-[2.5rem] border border-white/5">
                  <Droplets className="w-12 h-12 text-muted-foreground/20 mx-auto" />
                  <p className="text-muted-foreground italic">No individual logs found for this date.</p>
                </div>
              ) : (
                filteredLogs.map((log) => {
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

            <Button 
              variant="outline" 
              className="w-full h-12 rounded-xl border-white/10 text-muted-foreground font-bold hover:text-white"
              onClick={() => setSelectedDate(null)}
            >
              Back to Summaries
            </Button>
          </section>
        )}
      </div>
    </div>
  )
}
