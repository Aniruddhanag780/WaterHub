"use client"

import { useState } from "react"
import { useAuth } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useEffect } from "react"
import Link from "next/link"

export default function LoginPage() {
  const auth = useAuth()
  const { user } = useUser()
  const router = useRouter()
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
        initiateEmailSignUp(auth, email, password)
      } else {
        initiateEmailSignIn(auth, email, password)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuest = () => {
    setLoading(true)
    initiateAnonymousSignIn(auth)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4">
      <div className="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl text-black border border-slate-100">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {isSignUp ? "Create an Account" : "Welcome Back!"}
          </h1>
          <p className="text-slate-500 text-sm max-w-[280px] mx-auto">
            {isSignUp 
              ? "Join HydroTrack to start your hydration journey today." 
              : "Please enter your email below to sign in to your account."}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold text-slate-900 ml-1">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-slate-50 border border-slate-200 text-slate-900 h-12 rounded-xl placeholder:text-slate-400 px-4 focus:border-slate-400 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" title="Password Label" className="font-bold text-slate-900 ml-1">Password</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="........"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-slate-50 border border-slate-200 text-slate-900 h-12 rounded-xl placeholder:text-slate-400 px-4 focus:border-slate-400 transition-colors"
            />
            {!isSignUp && (
              <div className="text-right">
                <Button variant="link" className="text-xs font-bold text-slate-900 p-0 h-auto">
                  Forgot your password?
                </Button>
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base transition-all"
            disabled={loading}
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (isSignUp ? "Sign up" : "Sign in")}
          </Button>
        </form>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-8">
          <Button variant="outline" className="h-12 border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 p-0 text-xs font-bold" onClick={() => {}}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12.48 10.92v3.28h7.84c-.24 1.84-.96 3.4-2.12 4.52-1.48 1.44-3.76 2.52-7.2 2.52-5.92 0-10.84-4.8-10.84-10.72S5.04 2.8 10.96 2.8c3.2 0 5.68 1.28 7.4 2.92l2.4-2.4C18.6 1.28 15.12 0 11 0 4.92 0 0 4.92 0 11s4.92 11 11 11c3.28 0 6.16-1.08 8.4-3.24 2.32-2.28 3.12-5.52 3.12-8.32 0-.64-.04-1.24-.12-1.8H12.48z" />
            </svg>
            Google
          </Button>
          <Button variant="outline" className="h-12 border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 p-0 text-xs font-bold" onClick={() => {}}>
             <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#f35325" d="M1 1h10v10H1z"/><path fill="#81bc06" d="M12 1h10v10H12z"/><path fill="#05a6f0" d="M1 12h10v10H1z"/><path fill="#ffba08" d="M12 12h10v10H12z"/>
            </svg>
            Microsoft
          </Button>
          <Button variant="outline" className="h-12 border-slate-200 rounded-xl bg-white hover:bg-slate-50 transition-all flex items-center justify-center gap-2 p-0 text-xs font-bold" onClick={handleGuest}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Guest
          </Button>
        </div>

        <p className="text-[10px] text-center text-slate-400 leading-relaxed max-w-[280px] mx-auto mb-6">
          By continuing, you agree to our{" "}
          <Link href="#" className="underline font-bold text-slate-900">Terms of Service</Link>
          {" "}and{" "}
          <Link href="#" className="underline font-bold text-slate-900">Privacy Policy</Link>.
        </p>

        <div className="text-center pt-2">
          <p className="text-sm font-medium text-slate-500">
            {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
            <Button 
              variant="link" 
              className="text-slate-900 font-bold p-0 h-auto text-sm" 
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
