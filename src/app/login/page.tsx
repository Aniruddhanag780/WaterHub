
"use client"

import { useState } from "react"
import { useAuth } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Phone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useEffect } from "react"
import Link from "next/link"
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
          <h1 className="text-4xl font-extrabold tracking-tight text-white">
            {isSignUp ? "Join Us!" : "Welcome Back!"}
          </h1>
          <p className="text-white/70 text-lg leading-snug max-w-[280px] mx-auto font-medium">
            {isSignUp 
              ? "Start your hydration journey with us today." 
              : "Please enter your details below to access your account."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="font-bold text-primary text-base ml-1">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white/5 border-2 border-primary/30 text-white h-14 rounded-2xl placeholder:text-white/20 px-5 text-lg focus:bg-white/10 focus:border-primary transition-all shadow-inner"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" title="Password Label" className="font-bold text-primary text-base ml-1">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-white/5 border-2 border-primary/30 text-white h-14 rounded-2xl placeholder:text-white/20 px-5 text-lg focus:bg-white/10 focus:border-primary transition-all shadow-inner"
            />
            {!isSignUp && (
              <div className="text-right">
                <Button variant="link" className="text-sm font-bold text-primary p-0 h-auto hover:text-white hover:no-underline">
                  Forgot your password?
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-background font-black text-lg transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)]"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : (isSignUp ? "Sign up" : "Sign in")}
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10"></span>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-white/40">
            <span className="bg-[#0A0C14] px-4">OR CONTINUE WITH</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <Button variant="outline" className="h-14 border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2 px-0 text-xs font-bold" onClick={() => {}}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.96 3.4-2.12 4.52-1.48 1.44-3.76 2.52-7.2 2.52-5.92 0-10.84-4.8-10.84-10.72S5.04 2.8 10.96 2.8c3.2 0 5.68 1.28 7.4 2.92l2.4-2.4C18.6 1.28 15.12 0 11 0 4.92 0 0 4.92 0 11s4.92 11 11 11c3.28 0 6.16-1.08 8.4-3.24 2.32-2.28 3.12-5.52 3.12-8.32 0-.64-.04-1.24-.12-1.8H12.48z" />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="h-14 border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2 px-0 text-xs font-bold" onClick={() => {}}>
             <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H12z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Microsoft
          </Button>
          <Button variant="outline" className="h-14 border-white/10 rounded-2xl bg-white/5 hover:bg-white/10 text-white transition-all flex items-center justify-center gap-2 px-0 text-xs font-bold" onClick={handleGuest}>
            <Phone className="w-4 h-4 text-primary" />
            Guest
          </Button>
        </div>

        <div className="text-center space-y-6">
          <p className="text-[13px] text-white/40 font-medium leading-relaxed max-w-[320px] mx-auto">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline font-bold text-primary">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline font-bold text-primary">Privacy Policy</Link>.
          </p>

          <p className="text-base font-medium text-white/60">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button 
              variant="link" 
              className="text-primary font-black p-0 h-auto text-base hover:text-white hover:no-underline" 
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign in" : "Sign up"}
            </Button>
          </p>
        </div>
      </div>
    </div>
  )
}
