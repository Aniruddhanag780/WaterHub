
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc, query, orderBy } from "firebase/firestore"
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates"
import { GoogleDriveService } from "@/lib/google-drive"
import { useToast } from "@/hooks/use-toast"

export type WaterLog = {
  id: string
  amount?: number
  amountMl?: number
  timestamp: string | number
  userId?: string
}

export type AppNotification = {
  id: string
  type: 'login' | 'logout' | 'drive_connected' | 'goal_updated'
  title: string
  status: 'completed' | 'failed'
  timestamp: string
}

type HydrationContextType = {
  logs: WaterLog[]
  notifications: AppNotification[]
  goal: number
  reminders: string[]
  isDriveLinked: boolean
  addLog: (amount: number) => void
  removeLog: (id: string) => void
  addNotification: (type: AppNotification['type'], title: string, status: AppNotification['status']) => void
  setDailyGoal: (amount: number) => void
  setReminders: (times: string[]) => void
  setDriveLinked: (linked: boolean) => void
  syncLogsToDrive: (accessToken: string) => Promise<void>
  todayTotal: number
  streak: number
  history: Record<string, number>
  isLoading: boolean
}

const HydrationContext = createContext<HydrationContextType | undefined>(undefined)

export function HydrationProvider({ children }: { children: React.ReactNode }) {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const { toast } = useToast()

  const [localLogs, setLocalLogs] = useState<WaterLog[]>([])
  const [localNotifications, setLocalNotifications] = useState<AppNotification[]>([])
  const [localGoal, setLocalGoal] = useState<number>(2500)
  const [localReminders, setLocalReminders] = useState<string[]>([])
  const [localDriveLinked, setLocalDriveLinked] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "waterIntakes")
  }, [db, user])

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("timestamp", "desc")
    )
  }, [db, user])

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "profile", "profile")
  }, [db, user])

  const reminderRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid, "reminderSetting", "reminderSetting")
  }, [db, user])

  const { data: firestoreLogs, isLoading: isLogsLoading } = useCollection<WaterLog>(logsQuery)
  const { data: firestoreNotifications, isLoading: isNotificationsLoading } = useCollection<AppNotification>(notificationsQuery)
  const { data: firestoreProfile, isLoading: isProfileLoading } = useDoc<any>(profileRef)
  const { data: firestoreReminders, isLoading: isRemindersLoading } = useDoc<any>(reminderRef)

  useEffect(() => {
    const savedLogs = localStorage.getItem("hydrotrack_logs")
    const savedGoal = localStorage.getItem("hydrotrack_goal")
    const savedReminders = localStorage.getItem("hydrotrack_reminders")
    const savedDriveLinked = localStorage.getItem("hydrotrack_drive_linked")
    const savedNotifications = localStorage.getItem("hydrotrack_notifications")
    
    if (savedLogs) setLocalLogs(JSON.parse(savedLogs))
    if (savedGoal) setLocalGoal(Number(savedGoal))
    if (savedReminders) setLocalReminders(JSON.parse(savedReminders))
    if (savedDriveLinked) setLocalDriveLinked(savedDriveLinked === "true")
    if (savedNotifications) setLocalNotifications(JSON.parse(savedNotifications))
    
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (isHydrated && !user) {
      localStorage.setItem("hydrotrack_logs", JSON.stringify(localLogs))
      localStorage.setItem("hydrotrack_goal", localGoal.toString())
      localStorage.setItem("hydrotrack_reminders", JSON.stringify(localReminders))
      localStorage.setItem("hydrotrack_drive_linked", localDriveLinked.toString())
      localStorage.setItem("hydrotrack_notifications", JSON.stringify(localNotifications))
    }
  }, [localLogs, localGoal, localReminders, localDriveLinked, localNotifications, isHydrated, user])

  useEffect(() => {
    if (user && isHydrated && db) {
      const userRef = doc(db, "users", user.uid)
      setDocumentNonBlocking(userRef, {
        id: user.uid,
        email: user.email,
        displayName: user.displayName,
        externalAuthId: user.uid,
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }, { merge: true })

      if (localLogs.length > 0 || localGoal !== 2500 || localReminders.length > 0 || localDriveLinked || localNotifications.length > 0) {
        // Migrate Logs
        localLogs.forEach(log => {
          const colRef = collection(db, "users", user.uid, "waterIntakes")
          addDocumentNonBlocking(colRef, {
            amountMl: log.amountMl ?? log.amount,
            timestamp: new Date(log.timestamp).toISOString(),
            userId: user.uid,
            source: 'migrated',
            createdAt: new Date().toISOString()
          })
        })

        // Migrate Notifications
        localNotifications.forEach(notif => {
          const colRef = collection(db, "users", user.uid, "notifications")
          addDocumentNonBlocking(colRef, {
            userId: user.uid,
            type: notif.type,
            title: notif.title,
            status: notif.status,
            timestamp: notif.timestamp
          })
        })

        // Migrate Profile Settings
        const pRef = doc(db, "users", user.uid, "profile", "profile")
        setDocumentNonBlocking(pRef, {
          dailyGoalMl: localGoal,
          isDriveLinked: localDriveLinked,
          userId: user.uid,
          preferredUnit: 'ml',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          id: 'profile',
          wakeUpTime: "07:00",
          sleepTime: "22:00"
        }, { merge: true })

        // Migrate Reminders
        if (localReminders.length > 0) {
          const rRef = doc(db, "users", user.uid, "reminderSetting", "reminderSetting")
          setDocumentNonBlocking(rRef, {
            optimalReminderTimes: localReminders,
            userId: user.uid,
            isEnabled: true,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            id: 'reminderSetting',
            frequencyMinutes: 60,
            silentHoursStart: "22:00",
            silentHoursEnd: "07:00",
            reminderMessage: "Time to drink water!",
            smartRemindersEnabled: true
          }, { merge: true })
        }

        // Cleanup local state
        setLocalLogs([])
        setLocalGoal(2500)
        setLocalReminders([])
        setLocalDriveLinked(false)
        setLocalNotifications([])
        
        localStorage.removeItem("hydrotrack_logs")
        localStorage.removeItem("hydrotrack_goal")
        localStorage.removeItem("hydrotrack_reminders")
        localStorage.removeItem("hydrotrack_drive_linked")
        localStorage.removeItem("hydrotrack_notifications")
        
        toast({
          title: "Account Synced",
          description: "Your session data has been moved to your account.",
        })
      } else if (!isProfileLoading && !firestoreProfile && user) {
        // First time setup for fresh account
        const pRef = doc(db, "users", user.uid, "profile", "profile")
        setDocumentNonBlocking(pRef, {
          dailyGoalMl: 2500,
          isDriveLinked: false,
          userId: user.uid,
          preferredUnit: 'ml',
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          id: 'profile',
          wakeUpTime: "07:00",
          sleepTime: "22:00"
        }, { merge: true })
      }
    }
  }, [user, isHydrated, db, localLogs, localGoal, localReminders, localDriveLinked, localNotifications, firestoreProfile, isProfileLoading, toast, profileRef])

  const isLoading = isUserLoading || (user ? (isLogsLoading || isProfileLoading || isRemindersLoading || isNotificationsLoading) : !isHydrated)
  
  const logs = user ? (firestoreLogs || []) : localLogs
  const notifications = user ? (firestoreNotifications || []) : localNotifications
  const goal = user ? (firestoreProfile?.dailyGoalMl || localGoal) : localGoal
  const reminders = user ? (firestoreReminders?.optimalReminderTimes || localReminders) : localReminders
  const isDriveLinked = user ? (firestoreProfile?.isDriveLinked || false) : localDriveLinked

  const addNotification = (type: AppNotification['type'], title: string, status: AppNotification['status']) => {
    const timestamp = new Date().toISOString()
    if (user && db) {
      const colRef = collection(db, "users", user.uid, "notifications")
      addDocumentNonBlocking(colRef, {
        userId: user.uid,
        type,
        title,
        status,
        timestamp
      })
    } else {
      const newNotif: AppNotification = {
        id: Math.random().toString(36).substring(7),
        type,
        title,
        status,
        timestamp,
      }
      setLocalNotifications(prev => [newNotif, ...prev])
    }
  }

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
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      addNotification('goal_updated', `Goal set to ${amount}ml`, 'completed')
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
      }, { merge: true })
    } else {
      setLocalReminders(times)
    }
  }

  const setDriveLinked = (linked: boolean) => {
    if (user && db && profileRef) {
      setDocumentNonBlocking(profileRef, {
        isDriveLinked: linked,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      if (linked) {
        addNotification('drive_connected', 'Google Drive linked successfully', 'completed')
      }
    } else {
      setLocalDriveLinked(linked)
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
      addNotification('drive_connected', 'Manual backup to Drive', 'completed')
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Backup failed",
        description: error.message || "Could not save to Google Drive.",
      })
      addNotification('drive_connected', 'Manual backup to Drive', 'failed')
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
        notifications,
        goal,
        reminders,
        isDriveLinked,
        addLog,
        removeLog,
        addNotification,
        setDailyGoal,
        setReminders,
        setDriveLinked,
        syncLogsToDrive,
        todayTotal,
        streak,
        history,
        isLoading,
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
