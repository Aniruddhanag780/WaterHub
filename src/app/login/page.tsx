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
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl text-black border border-slate-100">
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            {isSignUp ? "Join Us!" : "Welcome Back!"}
          </h1>
          <p className="text-slate-500 text-lg leading-tight max-w-[300px] mx-auto">
            {isSignUp 
              ? "Start your hydration journey with us today." 
              : "Please enter your email below to sign in to your account."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="email" className="font-bold text-slate-900 text-base ml-1">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-50 border border-slate-200 text-slate-900 h-14 rounded-2xl placeholder:text-slate-400 px-5 text-lg focus:border-slate-400 transition-colors"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password" title="Password Label" className="font-bold text-slate-900 text-base ml-1">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-50 border border-slate-200 text-slate-900 h-14 rounded-2xl placeholder:text-slate-400 px-5 text-lg focus:border-slate-400 transition-colors"
            />
            {!isSignUp && (
              <div className="text-right">
                <Button variant="link" className="text-sm font-bold text-slate-900 p-0 h-auto">
                  Forgot your password?
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-14 rounded-2xl bg-[#1A1A1A] hover:bg-black text-white font-bold text-lg transition-all"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : (isSignUp ? "Sign up" : "Sign in")}
          </Button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-bold tracking-widest">OR CONTINUE WITH</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-10">
          <Button variant="outline" className="h-14 border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 px-0 text-sm font-bold" onClick={() => {}}>
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.96 3.4-2.12 4.52-1.48 1.44-3.76 2.52-7.2 2.52-5.92 0-10.84-4.8-10.84-10.72S5.04 2.8 10.96 2.8c3.2 0 5.68 1.28 7.4 2.92l2.4-2.4C18.6 1.28 15.12 0 11 0 4.92 0 0 4.92 0 11s4.92 11 11 11c3.28 0 6.16-1.08 8.4-3.24 2.32-2.28 3.12-5.52 3.12-8.32 0-.64-.04-1.24-.12-1.8H12.48z" />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="h-14 border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 px-0 text-sm font-bold" onClick={() => {}}>
             <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Microsoft
          </Button>
          <Button variant="outline" className="h-14 border-slate-200 rounded-2xl bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 px-0 text-sm font-bold" onClick={handleGuest}>
            <Phone className="w-5 h-5 text-slate-700" />
            Phone
          </Button>
        </div>

        <div className="text-center space-y-6">
          <p className="text-xs text-slate-400 font-medium leading-relaxed max-w-[280px] mx-auto">
            By continuing, you agree to our{" "}
            <Link href="#" className="underline font-bold text-slate-900">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="underline font-bold text-slate-900">Privacy Policy</Link>.
          </p>

          <p className="text-base font-medium text-slate-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button 
              variant="link" 
              className="text-slate-900 font-bold p-0 h-auto text-base" 
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
