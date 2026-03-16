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
  addLog: (amount: number) => void
  removeLog: (id: string) => void
  setDailyGoal: (amount: number) => void
  todayTotal: number
  history: Record<string, number>
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined)

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<WaterLog[]>([])
  const [goal, setGoal] = useState<number>(2500)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    const savedLogs = localStorage.getItem("hydrotrack_logs")
    const savedGoal = localStorage.getItem("hydrotrack_goal")
    if (savedLogs) setLogs(JSON.parse(savedLogs))
    if (savedGoal) setGoal(Number(savedGoal))
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

  const todayStr = new Date().toLocaleDateString()
  const todayTotal = logs
    .filter((log) => new Date(log.timestamp).toLocaleDateString() === todayStr)
    .reduce((acc, curr) => acc + curr.amount, 0)

  const history: Record<string, number> = logs.reduce((acc, log) => {
    const date = new Date(log.timestamp).toLocaleDateString()
    acc[date] = (acc[date] || 0) + log.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <HydrationContext.Provider
      value={{
        logs,
        goal,
        addLog,
        removeLog,
        setDailyGoal,
        todayTotal,
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