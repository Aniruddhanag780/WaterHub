"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser, useAuth } from "@/firebase"
import { useHydration } from "@/lib/store"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { UserCircle, Cloud, Check, RefreshCw, Loader2, LogOut, Mail, Calendar, Settings2, Power, Settings, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { connectGoogleDrive } from "@/firebase/non-blocking-login"
import { useToast } from "@/hooks/use-toast"
import { signOut } from "firebase/auth"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function AccountPage() {
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { 
    isDriveLinked, setDriveLinked, 
    isAutoSyncEnabled, setAutoSyncEnabled, 
    syncLogsToDrive, isLoading: isHydrationLoading, 
    addNotification, accessToken, setAccessToken 
  } = useHydration()
  const auth = useAuth()
  const { toast } = useToast()
  
  const [isSyncing, setIsSyncing] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showAutoSyncDialog, setShowAutoSyncDialog] = useState(false)

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login")
    }
  }, [user, isUserLoading, router])

  if (isUserLoading || isHydrationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="relative">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) return null

  const handleConnectDrive = async () => {
    setIsConnecting(true)
    try {
      const token = await connectGoogleDrive(auth)
      if (token) {
        setAccessToken(token)
        setDriveLinked(true)
        setShowAutoSyncDialog(true)
        toast({
          title: "Drive Backup Connected",
          description: "Your history will now be backed up to your personal cloud storage.",
        })
        addNotification('drive_connected', 'Google Drive Linked', 'completed')
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Connection Failed",
          description: err.message,
        })
      }
      if (auth.currentUser) {
        addNotification('drive_connected', 'Google Drive Link Attempt', 'failed')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSyncNow = async () => {
    let tokenToUse = accessToken
    
    // If we don't have a token in the current session, we must refresh it with a popup.
    // This happens after page refreshes or if the session expired.
    if (!tokenToUse) {
      setIsSyncing(true)
      try {
        const token = await connectGoogleDrive(auth)
        if (token) {
          tokenToUse = token
          setAccessToken(token)
        }
      } catch (err: any) {
        if (err.code !== 'auth/popup-closed-by-user') {
          toast({
            variant: "destructive",
            title: "Sync Failed",
            description: "Please reconnect to Google Drive to refresh your backup session.",
          })
        }
        setIsSyncing(false)
        return
      }
    }

    setIsSyncing(true)
    try {
      if (tokenToUse) await syncLogsToDrive(tokenToUse)
    } finally {
      setIsSyncing(false)
    }
  }

  const handleLogout = async () => {
    try {
      addNotification('logout', 'Account Sign Out', 'completed')
      await new Promise(resolve => setTimeout(resolve, 500))
      await signOut(auth)
      router.push("/login")
      toast({
        title: "Signed Out",
        description: "You have been successfully logged out.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error signing out",
        description: error.message,
      })
    }
  }

  return (
    <div className="space-y-8 max-w-lg mx-auto pb-10 text-white animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight">Account</h1>
          <p className="text-muted-foreground font-medium">Your personal profile and backup settings.</p>
        </div>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-2xl border-white/10 bg-white/5 h-12 w-12 hover:bg-white/10"
          onClick={() => router.push('/settings')}
        >
          <Settings className="w-6 h-6 text-primary" />
        </Button>
      </div>

      <div className="space-y-6">
        <section className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2 px-1">
            <UserCircle className="w-5 h-5 text-primary" /> Profile Details
          </h3>
          <Card className="border-white/10 bg-white/5 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl glass-card">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner group">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full rounded-2xl object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <UserCircle className="w-10 h-10 text-primary transition-transform group-hover:scale-110" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg text-white">{user.displayName || "WaterHub User"}</h4>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                    <Mail className="w-3.5 h-3.5" /> {user.email}
                  </div>
                  {user.metadata.creationTime && (
                    <div className="flex items-center gap-2 text-muted-foreground text-[10px] uppercase font-bold tracking-wider mt-1">
                      <Calendar className="w-3 h-3" /> Member since {new Date(user.metadata.creationTime).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="flex flex-col gap-3">
                  <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Service Connections</Label>
                  <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5 group hover:bg-white/10 transition-all shadow-inner">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg group-hover:scale-110 transition-transform">
                          <Cloud className="w-5 h-5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-white flex items-center gap-1.5">
                            Google Drive 
                            {isDriveLinked && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger>
                                    <Info className="w-3 h-3 text-muted-foreground hover:text-primary transition-colors" />
                                  </TooltipTrigger>
                                  <TooltipContent className="bg-slate-900 border-white/10 text-[10px] max-w-[180px]">
                                    Cloud linking is permanent. Temporary popups only appear to refresh your active backup session.
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                            {accessToken ? "Session Active" : "Session Required"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isDriveLinked && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSyncNow}
                            disabled={isSyncing}
                            className="rounded-lg border-white/10 h-8 px-4 font-bold text-xs bg-white/5 hover:bg-primary hover:text-black transition-all"
                          >
                            {isSyncing ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : accessToken ? (
                              <><RefreshCw className="w-3 h-3 mr-1" /> Sync Now</>
                            ) : (
                              <><RefreshCw className="w-3 h-3 mr-1" /> Refresh & Sync</>
                            )}
                          </Button>
                        )}
                        <Button 
                          variant={isDriveLinked ? "ghost" : "outline"} 
                          size="sm" 
                          onClick={isDriveLinked ? undefined : handleConnectDrive}
                          disabled={isConnecting}
                          className={cn(
                            "rounded-lg border-white/10 h-8 px-4 font-bold text-xs transition-all",
                            isDriveLinked ? "text-emerald-400 cursor-default hover:bg-transparent" : "hover:bg-primary hover:text-black hover:border-primary"
                          )}
                        >
                          {isConnecting ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : isDriveLinked ? (
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Linked</span>
                          ) : (
                            "Connect"
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {isDriveLinked && (
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between group/sync">
                        <div className="flex items-center gap-2">
                          <Settings2 className="w-3.5 h-3.5 text-muted-foreground" />
                          <span className="text-[10px] font-bold uppercase text-muted-foreground">Auto-Backup</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isAutoSyncEnabled ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setAutoSyncEnabled(false)
                                toast({
                                  title: "Auto-Sync Disabled",
                                  description: "Manual backups are still available.",
                                })
                              }}
                              className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
                            >
                              <Power className="w-3 h-3" />
                              Turn Off
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setAutoSyncEnabled(true)
                                toast({
                                  title: "Auto-Sync Enabled",
                                  description: "Daily midnight backups are now active.",
                                })
                              }}
                              className="h-8 px-3 rounded-lg text-[10px] font-bold uppercase border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-all"
                            >
                              Enable
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <Button 
                    variant="destructive" 
                    className="w-full h-12 rounded-xl font-bold flex items-center justify-center gap-2 group transition-all hover:bg-destructive/90 active:scale-[0.98] shadow-lg"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>

      <AlertDialog open={showAutoSyncDialog} onOpenChange={setShowAutoSyncDialog}>
        <AlertDialogContent className="bg-white rounded-[2.5rem] border-none shadow-2xl p-8 max-w-[90vw] w-[400px]">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shadow-inner">
              <Cloud className="w-8 h-8 text-blue-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Enable Auto-Sync?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-sm font-medium leading-relaxed">
              Keep your hydration data safe! With <strong>Auto-Sync</strong>, your history is automatically backed up to Google Drive every night before midnight.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-6">
            <AlertDialogAction 
              onClick={() => {
                setAutoSyncEnabled(true)
                setShowAutoSyncDialog(false)
                toast({
                  title: "Auto-Sync Active",
                  description: "Your data will now back up automatically every night.",
                })
              }}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-black font-bold text-base transition-all active:scale-[0.98] border-none"
            >
              Turn On Auto-Sync
            </AlertDialogAction>
            <AlertDialogCancel 
              className="w-full h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-bold hover:bg-slate-50 hover:text-slate-900"
              onClick={() => setShowAutoSyncDialog(false)}
            >
              Maybe Later
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
