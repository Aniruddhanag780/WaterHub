
"use client"

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from "react"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { collection, doc, query, orderBy, limit } from "firebase/firestore"
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
  type: 'login' | 'logout' | 'drive_connected' | 'drive_disconnected' | 'drive_sync' | 'goal_updated' | 'hydration_reminder' | 'water_added' | 'water_removed' | 'reminders_updated' | 'hydration_reminder_triggered'
  title: string
  status: 'completed' | 'failed'
  timestamp: string
}

export type DailySummary = {
  id: string
  date: string
  totalAmountMl: number
  goalMl: number
  userId: string
  achieved: boolean
  updatedAt: string
}

type HydrationContextType = {
  logs: WaterLog[]
  notifications: AppNotification[]
  dailySummaries: DailySummary[]
  goal: number
  reminders: string[]
  isDriveLinked: boolean
  isAutoSyncEnabled: boolean
  accessToken: string | null
  setAccessToken: (token: string | null) => void
  addLog: (amount: number) => void
  removeLog: (id: string) => void
  addNotification: (type: AppNotification['type'], title: string, status: AppNotification['status']) => void
  setDailyGoal: (amount: number) => void
  setReminders: (times: string[]) => void
  setDriveLinked: (linked: boolean) => void
  setAutoSyncEnabled: (enabled: boolean) => void
  syncLogsToDrive: (accessToken: string) => Promise<void>
  todayTotal: number
  streak: number
  history: Record<string, number>
  isLoading: boolean
  currentDate: string
  isRinging: boolean
  stopAlarm: () => void
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
  const [localAutoSyncEnabled, setLocalAutoSyncEnabled] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [tick, setTick] = useState(0)
  const [currentDate, setCurrentDate] = useState<string>("")
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isRinging, setIsRinging] = useState(false)
  
  const lastTriggeredTimeRef = useRef<string | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  // Firestore Queries
  const logsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "waterIntakes")
  }, [db, user])

  const summariesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(collection(db, "users", user.uid, "dailySummaries"), orderBy("updatedAt", "desc"))
  }, [db, user])

  const notificationsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "notifications"),
      orderBy("timestamp", "desc"),
      limit(20)
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
  const { data: firestoreSummaries, isLoading: isSummariesLoading } = useCollection<DailySummary>(summariesQuery)
  const { data: firestoreNotifications, isLoading: isNotificationsLoading } = useCollection<AppNotification>(notificationsQuery)
  const { data: firestoreProfile, isLoading: isProfileLoading } = useDoc<any>(profileRef)
  const { data: firestoreReminders, isLoading: isRemindersLoading } = useDoc<any>(reminderRef)

  // Configuration & State Logic
  const logs = user ? (firestoreLogs || []) : localLogs
  const notifications = user ? (firestoreNotifications || []) : localNotifications
  const dailySummaries = user ? (firestoreSummaries || []) : []
  const goal = user ? (firestoreProfile?.dailyGoalMl || localGoal) : localGoal
  const reminders = user ? (firestoreReminders?.optimalReminderTimes || localReminders) : localReminders
  const isDriveLinked = user ? (firestoreProfile?.isDriveLinked || false) : localDriveLinked
  const isAutoSyncEnabled = user ? (firestoreProfile?.isAutoSyncEnabled || false) : localAutoSyncEnabled

  const addNotification = useCallback((type: AppNotification['type'], title: string, status: AppNotification['status']) => {
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
      setLocalNotifications(prev => [newNotif, ...prev].slice(0, 50))
      localStorage.setItem("hydrotrack_notifications", JSON.stringify([newNotif, ...notifications].slice(0, 50)))
    }
  }, [user, db, notifications])

  const syncLogsToDrive = useCallback(async (tokenToUse: string) => {
    try {
      const backupData = {
        userId: user?.uid || 'guest',
        backupDate: new Date().toISOString(),
        logs,
        goal,
        reminders
      }
      await GoogleDriveService.uploadBackup(tokenToUse, `waterhub_backup_${new Date().toISOString().split('T')[0]}.json`, backupData)
      addNotification('drive_sync', 'Cloud Backup Complete', 'completed')
      return true
    } catch (error: any) {
      console.error("Backup failed", error)
      addNotification('drive_sync', 'Cloud Backup Attempt', 'failed')
      return false
    }
  }, [user, logs, goal, reminders, addNotification])

  const setReminders = useCallback((times: string[]) => {
    const sortedTimes = [...times].sort((a, b) => {
      return new Date(`2000/01/01 ${a}`).getTime() - new Date(`2000/01/01 ${b}`).getTime()
    })
    if (user && db && reminderRef) {
      setDocumentNonBlocking(reminderRef, {
        optimalReminderTimes: sortedTimes,
        userId: user.uid,
        isEnabled: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      addNotification('reminders_updated', 'Hydration schedule updated', 'completed')
    } else {
      setLocalReminders(sortedTimes)
      localStorage.setItem("hydrotrack_reminders", JSON.stringify(sortedTimes))
      addNotification('reminders_updated', 'Local schedule updated', 'completed')
    }
  }, [user, db, reminderRef, addNotification])

  const stopAlarm = useCallback(() => {
    setIsRinging(false)
  }, [])

  // Procedural Deep Beep Logic with increasing intensity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let intensity = 0

    const playBeep = () => {
      if (!isRinging) return

      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        }
        
        const ctx = audioContextRef.current
        // If context is suspended (common browser behavior), resume it
        if (ctx.state === 'suspended') {
          ctx.resume()
        }

        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        
        // Deep base frequency (150Hz) that increases slightly with intensity
        osc.type = 'sine'
        const baseFreq = 150
        osc.frequency.setValueAtTime(baseFreq + (intensity * 5), ctx.currentTime)
        
        // Volume increases with intensity
        const volume = Math.min(0.2 + (intensity * 0.08), 0.9)
        
        // Envelope: Quick attack, slight hold, exponential decay
        gain.gain.setValueAtTime(0, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.1)
        gain.gain.setValueAtTime(volume, ctx.currentTime + 0.3)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start()
        osc.stop(ctx.currentTime + 0.9)
        
        intensity++
        
        // Beep frequency (speed) increases with intensity
        // Starts at 2.5s intervals, accelerates down to 0.4s
        const nextDelay = Math.max(2500 - (intensity * 150), 400)
        timeoutId = setTimeout(playBeep, nextDelay)
      } catch (err) {
        console.warn("Audio trigger failed - likely waiting for user interaction", err)
      }
    }

    if (isRinging) {
      playBeep()
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [isRinging])

  // Alarm Trigger Logic
  useEffect(() => {
    const checkAlarms = () => {
      if (reminders.length === 0 || isRinging) return

      const now = new Date()
      const nowTimeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      
      const expiredReminders: string[] = []
      let triggerFound = false
      let triggeredReminderStr = ""

      reminders.forEach(r => {
        // Ensure standard comparison format
        const [rTime, rPeriod] = r.split(' ')
        const [rHour, rMin] = rTime.split(':')
        const paddedR = `${rHour.padStart(2, '0')}:${rMin} ${rPeriod}`
        
        const [nowT, nowP] = nowTimeStr.split(' ')
        const [nowH, nowM] = nowT.split(':')
        const paddedNow = `${nowH.padStart(2, '0')}:${nowM} ${nowP}`

        const rDate = new Date(`2000/01/01 ${paddedR}`)
        const nDate = new Date(`2000/01/01 ${paddedNow}`)

        if (nDate >= rDate) {
          expiredReminders.push(r)
          // Only ring if it's EXACTLY the time and we haven't triggered for this minute yet
          if (paddedR === paddedNow && lastTriggeredTimeRef.current !== nowTimeStr) {
            triggerFound = true
            triggeredReminderStr = r
          }
        }
      })

      if (triggerFound) {
        lastTriggeredTimeRef.current = nowTimeStr
        setIsRinging(true)
        toast({
          title: "💧 Time to Hydrate!",
          description: `Scheduled reminder at ${triggeredReminderStr}. Let's hit that goal!`,
          duration: 30000,
        })
        addNotification('hydration_reminder', `Hydration Alert: ${triggeredReminderStr}`, 'completed')
      }

      // Automatically clean up past reminders that didn't trigger (e.g. app was closed)
      if (expiredReminders.length > 0 && !triggerFound) {
        const remaining = reminders.filter(r => !expiredReminders.includes(r))
        if (remaining.length !== reminders.length) {
          setReminders(remaining)
        }
      }
    }

    const interval = setInterval(checkAlarms, 10000) // Check every 10 seconds
    return () => clearInterval(interval)
  }, [reminders, toast, addNotification, setReminders, isRinging])

  // Midnight Refresh Logic
  useEffect(() => {
    const today = new Date().toLocaleDateString()
    setCurrentDate(today)

    const now = new Date()
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0)
    const msToMidnight = midnight.getTime() - now.getTime()

    const timeout = setTimeout(async () => {
      if (isAutoSyncEnabled && accessToken) {
        await syncLogsToDrive(accessToken)
      }

      const nextDate = new Date().toLocaleDateString()
      setCurrentDate(nextDate)
      setTick(prev => prev + 1)
      toast({
        title: "New Day Started",
        description: "Your hydration goal and activity feed have been reset.",
      })
    }, msToMidnight + 100)

    return () => clearTimeout(timeout)
  }, [tick, toast, isAutoSyncEnabled, accessToken, syncLogsToDrive])

  // Local Storage Hydration
  useEffect(() => {
    const savedLogs = localStorage.getItem("hydrotrack_logs")
    const savedGoal = localStorage.getItem("hydrotrack_goal")
    const savedReminders = localStorage.getItem("hydrotrack_reminders")
    const savedDriveLinked = localStorage.getItem("hydrotrack_drive_linked")
    const savedAutoSync = localStorage.getItem("hydrotrack_auto_sync")
    const savedNotifications = localStorage.getItem("hydrotrack_notifications")
    
    if (savedLogs) setLocalLogs(JSON.parse(savedLogs))
    if (savedGoal) setLocalGoal(Number(savedGoal))
    if (savedReminders) setLocalReminders(JSON.parse(savedReminders))
    if (savedDriveLinked) setLocalDriveLinked(savedDriveLinked === "true")
    if (savedAutoSync) setLocalAutoSyncEnabled(savedAutoSync === "true")
    if (savedNotifications) setLocalNotifications(JSON.parse(savedNotifications))

    const savedToken = sessionStorage.getItem("waterhub_access_token")
    if (savedToken) setAccessToken(savedToken)
    
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (accessToken) {
      sessionStorage.setItem("waterhub_access_token", accessToken)
    } else {
      sessionStorage.removeItem("waterhub_access_token")
    }
  }, [accessToken])

  // Sync Guest Data to Firestore
  useEffect(() => {
    if (user && isHydrated && db) {
      if (localLogs.length > 0 || localGoal !== 2500 || localReminders.length > 0 || localDriveLinked || localAutoSyncEnabled || localNotifications.length > 0) {
        setLocalLogs([])
        setLocalGoal(2500)
        setLocalReminders([])
        setLocalDriveLinked(false)
        setLocalAutoSyncEnabled(false)
        setLocalNotifications([])
        
        localStorage.removeItem("hydrotrack_logs")
        localStorage.removeItem("hydrotrack_goal")
        localStorage.removeItem("hydrotrack_reminders")
        localStorage.removeItem("hydrotrack_drive_linked")
        localStorage.removeItem("hydrotrack_auto_sync")
        localStorage.removeItem("hydrotrack_notifications")
      }
    }
  }, [user, isHydrated, db, localLogs, localGoal, localReminders, localDriveLinked, localAutoSyncEnabled, localNotifications])

  const isLoading = isUserLoading || (user ? (isLogsLoading || isProfileLoading || isRemindersLoading || isNotificationsLoading || isSummariesLoading) : !isHydrated)

  const updateDailySummary = (date: string, amountChange: number) => {
    if (!user || !db) return

    const summaryId = date.replace(/\//g, '-')
    const summaryRef = doc(db, "users", user.uid, "dailySummaries", summaryId)

    const logsForDay = logs.filter(l => new Date(l.timestamp).toLocaleDateString() === date)
    const newTotal = logsForDay.reduce((acc, l) => acc + (l.amountMl ?? l.amount ?? 0), 0) + amountChange

    setDocumentNonBlocking(summaryRef, {
      id: summaryId,
      date: date,
      totalAmountMl: newTotal,
      goalMl: goal,
      userId: user.uid,
      achieved: newTotal >= goal,
      updatedAt: new Date().toISOString()
    }, { merge: true })
  }

  const addLog = (amount: number) => {
    if (isRinging) stopAlarm()
    
    const timestamp = Date.now()
    const dateStr = new Date(timestamp).toLocaleDateString()

    if (user && db) {
      const colRef = collection(db, "users", user.uid, "waterIntakes")
      addDocumentNonBlocking(colRef, {
        amountMl: amount,
        timestamp: new Date(timestamp).toISOString(),
        userId: user.uid,
        source: 'manual',
        createdAt: new Date().toISOString()
      })
      updateDailySummary(dateStr, amount)
      addNotification('water_added', `Logged ${amount}ml water`, 'completed')
    } else {
      const newLog: WaterLog = {
        id: Math.random().toString(36).substring(7),
        amount,
        timestamp,
      }
      setLocalLogs((prev) => [...prev, newLog])
      localStorage.setItem("hydrotrack_logs", JSON.stringify([...localLogs, newLog]))
      addNotification('water_added', `Logged ${amount}ml water (local)`, 'completed')
    }
  }

  const removeLog = (id: string) => {
    const logToRemove = logs.find(l => l.id === id)
    if (!logToRemove) return

    const dateStr = new Date(logToRemove.timestamp).toLocaleDateString()
    const amount = logToRemove.amountMl ?? logToRemove.amount ?? 0

    if (user && db) {
      const docRef = doc(db, "users", user.uid, "waterIntakes", id)
      deleteDocumentNonBlocking(docRef)
      updateDailySummary(dateStr, -amount)
      addNotification('water_removed', `Removed ${amount}ml log`, 'completed')
    } else {
      const remaining = localLogs.filter((log) => log.id !== id)
      setLocalLogs(remaining)
      localStorage.setItem("hydrotrack_logs", JSON.stringify(remaining))
      addNotification('water_removed', `Removed ${amount}ml log (local)`, 'completed')
    }
  }

  const setDailyGoal = (amount: number) => {
    if (user && db && profileRef) {
      setDocumentNonBlocking(profileRef, {
        dailyGoalMl: amount,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      addNotification('goal_updated', `Goal updated to ${amount}ml`, 'completed')
    } else {
      setLocalGoal(amount)
      localStorage.setItem("hydrotrack_goal", amount.toString())
      addNotification('goal_updated', `Local goal set to ${amount}ml`, 'completed')
    }
  }

  const setDriveLinked = (linked: boolean) => {
    if (user && db && profileRef) {
      setDocumentNonBlocking(profileRef, {
        isDriveLinked: linked,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
      addNotification(linked ? 'drive_connected' : 'drive_disconnected', linked ? 'Google Drive Linked' : 'Google Drive Unlinked', 'completed')
    } else {
      setLocalDriveLinked(linked)
      localStorage.setItem("hydrotrack_drive_linked", linked.toString())
      addNotification(linked ? 'drive_connected' : 'drive_disconnected', linked ? 'Cloud service connected' : 'Cloud service disconnected', 'completed')
    }
  }

  const setAutoSyncEnabled = (enabled: boolean) => {
    if (user && db && profileRef) {
      setDocumentNonBlocking(profileRef, {
        isAutoSyncEnabled: enabled,
        userId: user.uid,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    } else {
      setLocalAutoSyncEnabled(enabled)
      localStorage.setItem("hydrotrack_auto_sync", enabled.toString())
    }
  }

  const todayTotal = logs
    .filter((log) => {
      if (!currentDate) return false
      const logDate = log.timestamp ? new Date(log.timestamp) : new Date()
      return logDate.toLocaleDateString() === currentDate
    })
    .reduce((acc, curr) => acc + (curr.amountMl ?? curr.amount ?? 0), 0)

  const historyMap: Record<string, number> = logs.reduce((acc, log) => {
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
      const totalForDay = historyMap[dateKey] || 0
      
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
  }, [historyMap, goal])

  return (
    <HydrationContext.Provider
      value={{
        logs,
        notifications,
        dailySummaries,
        goal,
        reminders,
        isDriveLinked,
        isAutoSyncEnabled,
        accessToken,
        setAccessToken,
        addLog,
        removeLog,
        addNotification,
        setDailyGoal,
        setReminders,
        setDriveLinked,
        setAutoSyncEnabled,
        syncLogsToDrive: async (token) => {
          const success = await syncLogsToDrive(token)
          if (success) {
            toast({
              title: "Backup successful",
              description: "Your hydration history has been saved to Google Drive.",
            })
          } else {
            toast({
              variant: "destructive",
              title: "Backup failed",
              description: "Could not save to Google Drive.",
            })
          }
        },
        todayTotal,
        streak,
        history: historyMap,
        isLoading,
        currentDate,
        isRinging,
        stopAlarm
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
