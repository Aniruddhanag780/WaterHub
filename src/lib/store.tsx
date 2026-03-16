
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type WaterLog = {
  id: string
  amount: number
  timestamp: number
}

type HydrationContextType = {
  logs: WaterLog[]
  goal: number
  reminders: string[]
  addLog: (amount: number) => void
  removeLog: (id: string) => void
  setDailyGoal: (amount: number) => void
  setReminders: (times: string[]) => void
  todayTotal: number
  streak: number
  history: Record<string, number>
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined)

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<WaterLog[]>([])
  const [goal, setGoal] = useState<number>(2500)
  const [reminders, setRemindersState] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const savedLogs = localStorage.getItem("hydrotrack_logs")
    const savedGoal = localStorage.getItem("hydrotrack_goal")
    const savedReminders = localStorage.getItem("hydrotrack_reminders")
    if (savedLogs) setLogs(JSON.parse(savedLogs))
    if (savedGoal) setGoal(Number(savedGoal))
    if (savedReminders) setRemindersState(JSON.parse(savedReminders))
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("hydrotrack_logs", JSON.stringify(logs))
    }
  }, [logs, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("hydrotrack_goal", goal.toString())
    }
  }, [goal, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("hydrotrack_reminders", JSON.stringify(reminders))
    }
  }, [reminders, isHydrated])

  const addLog = (amount: number) => {
    const newLog: WaterLog = {
      id: Math.random().toString(36).substring(7),
      amount,
      timestamp: Date.now(),
    }
    setLogs((prev) => [...prev, newLog])
  }

  const removeLog = (id: string) => {
    setLogs((prev) => prev.filter((log) => log.id !== id))
  }

  const setDailyGoal = (amount: number) => {
    setGoal(amount)
  }

  const setReminders = (times: string[]) => {
    setRemindersState(times)
  }

  const todayStr = new Date().toLocaleDateString()
  const todayTotal = logs
    .filter((log) => new Date(log.timestamp).toLocaleDateString() === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0)

  // Proper history calculation
  const history: Record<string, number> = logs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString()
    acc[date] = (acc[date] || 0) + log.amount
    return acc
  }, {} as Record<string, number>)

  // Real Streak Calculation
  const streak = React.useMemo(() => {
    let currentStreak = 0
    const checkDate = new Date()
    
    // Check backwards from today
    while (true) {
      const dateKey = checkDate.toLocaleDateString()
      const totalForDay = history[dateKey] || 0
      
      if (totalForDay >= goal) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        // If it's today and goal not met, streak might still be alive from yesterday
        if (dateKey === new Date().toLocaleDateString()) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
        break
      }
      
      // Safety break to prevent infinite loops (though setDate handles this)
      if (currentStreak > 1000) break
    }
    return currentStreak
  }, [history, goal])

  return (
    <HydrationContext.Provider
      value={{
        logs,
        goal,
        reminders,
        addLog,
        removeLog,
        setDailyGoal,
        setReminders,
        todayTotal,
        streak,
        history,
      }}
    >
      {children}
    </HydrationContext.Provider>
  )
}

export function useHydration() {
  const context = useContext(HydrationContext)
  if (context === undefined) {
    throw new Error("useHydration must be used within a HydrationProvider")
  }
  return context
}
