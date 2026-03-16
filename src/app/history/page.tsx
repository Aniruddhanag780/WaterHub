"use client"

import { useState } from "react"
import { useHydration } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Calendar, Droplets, CheckCircle2, XCircle, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HistoryPage() {
  const { logs, history, removeLog, goal } = useHydration()
  const [showAll, setShowAll] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Sort dates descending (newest first)
  const sortedDates = Object.keys(history).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  // Dates to display based on "showAll" state
  const displayedDates = showAll ? sortedDates : sortedDates.slice(0, 4)

  // Filter logs for the selected date or show most recent globally if none selected
  const filteredLogs = [...logs]
    .filter(log => {
      if (!selectedDate) return true // Show all recent logs if no date selected
      const logDate = new Date(log.timestamp).toLocaleDateString()
      return logDate === selectedDate
    })
    .sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return timeB - timeA
    })

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-10">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Intake History</h1>
        <p className="text-muted-foreground font-medium">Review your hydration journey and goal completion.</p>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold flex items-center gap-2 text-white">
              <Calendar className="w-5 h-5 text-primary" /> Daily Summaries
            </h3>
            {selectedDate && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-primary h-auto p-0 hover:bg-transparent"
                onClick={() => setSelectedDate(null)}
              >
                Clear Filter
              </Button>
            )}
          </div>
          
          <div className="grid gap-3">
            {sortedDates.length === 0 ? (
              <p className="text-muted-foreground italic p-8 text-center bg-white/5 rounded-[2rem] border-2 border-dashed border-white/10">
                No data yet. Start drinking!
              </p>
            ) : (
              <>
                {displayedDates.map((date) => {
                  const totalAmount = history[date]
                  const achieved = totalAmount >= goal
                  const isSelected = selectedDate === date
                  
                  return (
                    <Card 
                      key={date} 
                      className={cn(
                        "border-white/10 bg-white/5 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl transition-all cursor-pointer hover:bg-white/10 active:scale-[0.98]",
                        isSelected && "border-primary ring-1 ring-primary/50 bg-primary/5"
                      )}
                      onClick={() => setSelectedDate(isSelected ? null : date)}
                    >
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{date}</p>
                          <div className="flex items-baseline gap-1">
                            <p className="text-2xl font-black text-primary">{totalAmount}</p>
                            <p className="text-xs font-bold text-primary/60">/ {goal} ml</p>
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

                {sortedDates.length > 4 && (
                  <Button 
                    variant="ghost" 
                    className="w-full text-muted-foreground hover:text-white mt-2 font-bold py-6 bg-white/5 rounded-2xl border border-white/5"
                    onClick={() => setShowAll(!showAll)}
                  >
                    {showAll ? (
                      <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                    ) : (
                      <><ChevronDown className="w-4 h-4 mr-2" /> See More ({sortedDates.length - 4} more)</>
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-white">
            <Droplets className="w-5 h-5 text-primary" /> 
            {selectedDate ? `Logs for ${selectedDate}` : "Recent Logs"}
          </h3>
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8 italic bg-white/5 rounded-2xl">No logs found for this selection.</p>
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
                          {!selectedDate && ` • ${new Date(log.timestamp).toLocaleDateString()}`}
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
