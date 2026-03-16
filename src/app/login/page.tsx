
"use client"

import { useState } from "react"
import { useAuth } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, Lock, User, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const auth = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const { toast } = useToast()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      router.push("/")
    }
  }, [user, router])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        await initiateEmailSignUp(auth, email, password)
      } else {
        await initiateEmailSignIn(auth, email, password)
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: err.code === 'auth/operation-not-allowed' 
          ? "Email/Password sign-in is not enabled in your Firebase Console. Please enable it to continue."
          : err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = async () => {
    setLoading(true)
    try {
      await initiateAnonymousSignIn(auth)
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: err.code === 'auth/operation-not-allowed' 
          ? "Anonymous sign-in is not enabled in your Firebase Console."
          : err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 py-10">
      <div className="w-full max-w-md glass-card rounded-[2.5rem] p-10 shadow-2xl border border-white/10 ring-1 ring-white/5 backdrop-blur-xl">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-flex p-4 rounded-3xl bg-primary/10 mb-2 border border-primary/20">
            <ShieldCheck className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            {isSignUp ? "Join Us" : "Welcome Back"}
          </h1>
          <p className="text-white/60 text-lg leading-snug font-medium max-w-[280px] mx-auto">
            {isSignUp 
              ? "Start your intelligent hydration journey today." 
              : "Sign in to access your hydration insights."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="font-bold text-primary text-[10px] uppercase tracking-[0.2em] ml-1">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-2 border-white/10 text-white h-14 rounded-2xl placeholder:text-white/20 pl-12 pr-5 text-lg focus:bg-white/10 focus:border-primary/50 transition-all shadow-inner"
              />
            </div>
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" title="Password Label" className="font-bold text-primary text-[10px] uppercase tracking-[0.2em] ml-1">Password</Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-2 border-white/10 text-white h-14 rounded-2xl placeholder:text-white/20 pl-12 pr-5 text-lg focus:bg-white/10 focus:border-primary/50 transition-all shadow-inner"
              />
            </div>
            {!isSignUp && (
              <div className="text-right">
                <Button variant="link" className="text-xs font-bold text-primary/60 p-0 h-auto hover:text-primary hover:no-underline">
                  Forgot your password?
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-background font-black text-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] active:scale-95"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : (isSignUp ? "Create Account" : "Sign In")}
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-white/40">
            <span className="bg-background px-4">OR CONTINUE AS</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full h-14 border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-3 text-base font-bold active:scale-95" 
          onClick={handleGuest}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <User className="w-5 h-5 text-primary" />}
          Continue as Guest
        </Button>

        <div className="text-center mt-10 space-y-4">
          <p className="text-base font-medium text-white/60">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button 
              variant="link" 
              className="text-primary font-black p-0 h-auto text-base hover:text-white hover:no-underline" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
