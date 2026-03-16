
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc } from "firebase/firestore"
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { GoogleDriveService } from "@/lib/google-drive"
import { useToast } from "@/hooks/use-toast"

export type WaterLog = {
  id: string
  amount?: number       // For local storage/legacy
  amountMl?: number     // For Firestore/Backend alignment
  timestamp: string | number
  userId?: string
}

type HydrationContextType = {
  logs: WaterLog[]
  goal: number
  reminders: string[]
  addLog: (amount: number) => void
  removeLog: (id: string) => void
  setDailyGoal: (amount: number) => void
  setReminders: (times: string[]) => void
  syncLogsToDrive: (accessToken: string) => Promise<void>
  todayTotal: number
  streak: number
  history: Record<string, number>
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined)

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  // Local State (Fallback/Guest mode)
  const [localLogs, setLocalLogs] = useState<WaterLog[]>([])
  const [localGoal, setLocalGoal] = useState<number>(2500)
  const [localReminders, setLocalReminders] = useState<string[]>([])
  const [isHydrated, setIsHydrated] = useState(false)

  // Firestore Data
  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "waterIntakes")
  }, [db, user])

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "profile", "profile")
  }, [db, user])

  const reminderRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "reminderSetting", "reminderSetting")
  }, [db, user])

  const { data: firestoreLogs } = useCollection<WaterLog>(logsQuery)
  const { data: firestoreProfile } = useDoc<any>(profileRef)
  const { data: firestoreReminders } = useDoc<any>(reminderRef)

  // Load from localStorage on mount
  useEffect(() => {
    const savedLogs = localStorage.getItem("hydrotrack_logs")
    const savedGoal = localStorage.getItem("hydrotrack_goal")
    const savedReminders = localStorage.getItem("hydrotrack_reminders")
    if (savedLogs) setLocalLogs(JSON.parse(savedLogs))
    if (savedGoal) setLocalGoal(Number(savedGoal))
    if (savedReminders) setLocalReminders(JSON.parse(savedReminders))
    setIsHydrated(true)
  }, [])

  // Persist guest data to localStorage
  useEffect(() => {
    if (isHydrated && !user) {
      localStorage.setItem("hydrotrack_logs", JSON.stringify(localLogs))
      localStorage.setItem("hydrotrack_goal", localGoal.toString())
      localStorage.setItem("hydrotrack_reminders", JSON.stringify(localReminders))
    }
  }, [localLogs, localGoal, localReminders, isHydrated, user])

  // Merge Data Logic
  const logs = user ? (firestoreLogs || []) : localLogs
  const goal = user ? (firestoreProfile?.dailyGoalMl || localGoal) : localGoal
  const reminders = user ? (firestoreReminders?.optimalReminderTimes || localReminders) : localReminders

  const addLog = (amount: number) => {
    const timestamp = Date.now()
    if (user && db) {
      const colRef = collection(db, "users", user.uid, "waterIntakes")
      addDocumentNonBlocking(colRef, {
        amountMl: amount,
        timestamp: new Date(timestamp).toISOString(),
        userId: user.uid,
        source: 'manual',
        createdAt: new Date().toISOString()
      })
    } else {
      const newLog: WaterLog = {
        id: Math.random().toString(36).substring(7),
        amount,
        timestamp,
      }
      setLocalLogs((prev) => [...prev, newLog])
    }
  }

  const removeLog = (id: string) => {
    if (user && db) {
      const docRef = doc(db, "users", user.uid, "waterIntakes", id)
      deleteDocumentNonBlocking(docRef)
    } else {
      setLocalLogs((prev) => prev.filter((log) => log.id !== id))
    }
  }

  const setDailyGoal = (amount: number) => {
    if (user && db && profileRef) {
      setDocumentNonBlocking(profileRef, {
        dailyGoalMl: amount,
        userId: user.uid,
        preferredUnit: 'ml',
        updatedAt: new Date().toISOString(),
        id: 'profile'
      }, { merge: true })
    } else {
      setLocalGoal(amount)
    }
  }

  const setReminders = (times: string[]) => {
    if (user && db && reminderRef) {
      setDocumentNonBlocking(reminderRef, {
        optimalReminderTimes: times,
        userId: user.uid,
        isEnabled: true,
        updatedAt: new Date().toISOString(),
        id: 'reminderSetting'
      }, { merge: true })
    } else {
      setLocalReminders(times)
    }
  }

  const syncLogsToDrive = async (accessToken: string) => {
    try {
      const backupData = {
        userId: user?.uid || 'guest',
        backupDate: new Date().toISOString(),
        logs,
        goal,
        reminders
      }
      await GoogleDriveService.uploadBackup(accessToken, `hydrotrack_backup_${new Date().toISOString().split('T')[0]}.json`, backupData)
      toast({
        title: "Backup successful",
        description: "Your hydration history has been saved to Google Drive.",
      })
    } catch (error: any) {
      let message = error.message || "Could not save to Google Drive."
      if (message.includes("Google Drive API has not been used") || message.includes("disabled")) {
        message = "The Google Drive API is disabled. Please enable it in the Google Cloud Console for this project."
      }
      toast({
        variant: "destructive",
        title: "Backup failed",
        description: message,
      })
    }
  }

  const todayStr = new Date().toLocaleDateString()
  const todayTotal = logs
    .filter((log) => {
      const logDate = log.timestamp ? new Date(log.timestamp) : new Date()
      return logDate.toLocaleDateString() === todayStr
    })
    .reduce((acc, curr) => acc + (curr.amountMl ?? curr.amount ?? 0), 0)

  const history: Record<string, number> = logs.reduce((acc, log) => {
    const amount = log.amountMl ?? log.amount ?? 0
    const logDate = log.timestamp ? new Date(log.timestamp) : new Date()
    const date = logDate.toLocaleDateString()
    acc[date] = (acc[date] || 0) + amount
    return acc
  }, {} as Record<string, number>)

  const streak = React.useMemo(() => {
    let currentStreak = 0
    const checkDate = new Date()
    
    while (true) {
      const dateKey = checkDate.toLocaleDateString()
      const totalForDay = history[dateKey] || 0
      
      if (totalForDay >= goal) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        if (dateKey === new Date().toLocaleDateString()) {
          checkDate.setDate(checkDate.getDate() - 1)
          continue
        }
        break
      }
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
        syncLogsToDrive,
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
