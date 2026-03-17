"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/firebase"
import { 
  initiateEmailSignIn, 
  initiateEmailSignUp, 
  initiateAnonymousSignIn,
  initiateGoogleSignIn,
  initiateMicrosoftSignIn,
  initiatePasswordReset
} from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, User, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { useHydration } from "@/lib/store"
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

export default function LoginPage() {
  const auth = useAuth()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useHydration()
  
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState<string | null>(null)
  
  const [showWarning, setShowWarning] = useState(false)
  const [pendingAction, setPendingAction] = useState<"guest" | "signup" | null>(null)

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push("/")
    }
  }, [user, isUserLoading, router])

  const executeAuth = async () => {
    setLoading(true)
    try {
      if (pendingAction === "signup") {
        await initiateEmailSignUp(auth, email, password)
        addNotification('login', 'New Account Created', 'completed')
      } else if (pendingAction === "guest") {
        await initiateAnonymousSignIn(auth)
        addNotification('login', 'Guest Session Started', 'completed')
      }
      setShowWarning(false)
      setPendingAction(null)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Auth Error",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAuthAttempt = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      setPendingAction("signup")
      setShowWarning(true)
    } else {
      setLoading(true)
      try {
        await initiateEmailSignIn(auth, email, password)
        addNotification('login', 'Email Login', 'completed')
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: err.message,
        })
      } finally {
        setLoading(false)
      }
    }
  }

  const handleForgotPassword = () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Missing Email",
        description: "Please enter your email address first to reset your password.",
      })
      return
    }

    setLoading(true)
    initiatePasswordReset(auth, email)
      .then(() => {
        toast({
          title: "Reset Email Sent",
          description: "Check your inbox for a link to reset your password.",
        })
      })
      .catch((err: any) => {
        toast({
          variant: "destructive",
          title: "Reset Error",
          description: err.message,
        })
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleGuestAttempt = () => {
    setPendingAction("guest")
    setShowWarning(true)
  }

  const handleGoogleSignIn = async () => {
    setSocialLoading("google")
    try {
      await initiateGoogleSignIn(auth)
      addNotification('login', 'Google Login', 'completed')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: err.message,
        })
      }
    } finally {
      setSocialLoading(null)
    }
  }

  const handleMicrosoftSignIn = async () => {
    setSocialLoading("microsoft")
    try {
      await initiateMicrosoftSignIn(auth)
      addNotification('login', 'Microsoft Login', 'completed')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: err.message,
        })
      }
    } finally {
      setSocialLoading(null)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#09090b]">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (user) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-10 bg-[#09090b]">
      <div className="w-full max-w-[400px] bg-white rounded-[2rem] p-8 shadow-2xl text-black border border-black/10">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-black">
            {isSignUp ? "Create Account" : "Welcome Back!"}
          </h1>
          <p className="text-muted-foreground text-sm px-4 font-medium">
            {isSignUp 
              ? "Join HydroTrack to start your intelligent hydration journey." 
              : "Please enter your email below to sign in to your account."}
          </p>
        </div>

        <form onSubmit={handleAuthAttempt} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="font-semibold text-sm">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[#f4f4f5] border-[#e4e4e7] text-black h-12 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-black/20"
            />
          </div>
          <div className="space-y-1.5 relative">
            <Label htmlFor="password" title="Password Label" className="font-semibold text-sm">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[#f4f4f5] border-[#e4e4e7] text-black h-12 rounded-xl placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-black/20"
            />
          </div>

          {!isSignUp && (
            <div className="flex justify-end mt-2">
              <Button 
                type="button"
                variant="link" 
                onClick={handleForgotPassword}
                className="text-xs font-medium text-black p-0 h-auto hover:text-black/70 underline transition-colors"
              >
                Forgot password?
              </Button>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-[#18181b] hover:bg-[#18181b]/90 text-white font-semibold text-base transition-all active:scale-[0.98] mt-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading && !socialLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (isSignUp ? "Sign Up" : "Sign in")}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted/50"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            <span className="bg-white px-3">OR CONTINUE WITH</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-8">
          <Button 
            variant="outline" 
            className="h-11 border-[#e4e4e7] rounded-xl bg-white hover:bg-muted/10 text-black flex items-center justify-center gap-2 text-xs font-semibold transition-all disabled:opacity-50" 
            onClick={handleGoogleSignIn} 
            disabled={loading}
          >
            {socialLoading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Google
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="h-11 border-[#e4e4e7] rounded-xl bg-white hover:bg-muted/10 text-black flex items-center justify-center gap-2 text-xs font-semibold transition-all disabled:opacity-50" 
            onClick={handleMicrosoftSignIn} 
            disabled={loading}
          >
            {socialLoading === "microsoft" ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#f35325" d="M1 1h10v10H1z"/>
                  <path fill="#81bc06" d="M12 1h10v10H12z"/>
                  <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                  <path fill="#ffba08" d="M12 12h10v10H12z"/>
                </svg>
                Microsoft
              </>
            )}
          </Button>

          <Button 
            variant="outline" 
            className="h-11 border-[#e4e4e7] rounded-xl bg-white hover:bg-muted/10 text-black flex items-center justify-center gap-2 text-xs font-semibold transition-all disabled:opacity-50" 
            onClick={handleGuestAttempt}
            disabled={loading}
          >
            {socialLoading === "guest" ? <Loader2 className="w-4 h-4 animate-spin text-black" /> : (
              <>
                <User className="w-4 h-4" />
                Guest
              </>
            )}
          </Button>
        </div>

        <div className="text-center space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed px-2">
            By continuing, you agree to our <Link href="#" className="underline font-medium text-black">Terms of Service</Link> and <Link href="#" className="underline font-medium text-black">Privacy Policy</Link>.
          </p>
          <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground font-medium">
            <span>{isSignUp ? "Already have an account?" : "Don't have an account?"}</span>
            <Button 
              variant="link" 
              className="text-black font-medium p-0 h-auto text-sm underline hover:text-black/70 transition-colors" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </div>
        </div>
      </div>

      {/* Data Retention Warning Dialog */}
      <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl max-w-[90vw] w-[400px]">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900">Data Retention Notice</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base">
              You are about to use a temporary session. Please note that all hydration data and history will be <strong>deleted after 30 days</strong> of inactivity.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-3 mt-6">
            <AlertDialogAction 
              onClick={executeAuth}
              className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
            >
              I understand, proceed
            </AlertDialogAction>
            <AlertDialogCancel 
              className="w-full h-12 rounded-xl border-slate-200 bg-white text-slate-900 font-semibold hover:bg-slate-50"
              onClick={() => {
                setShowWarning(false)
                setPendingAction(null)
              }}
            >
              Sign in with another account
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
