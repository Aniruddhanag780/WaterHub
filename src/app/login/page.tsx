"use client"

import { useState } from "react"
import { useAuth } from "@/firebase"
import { initiateEmailSignIn, initiateEmailSignUp, initiateAnonymousSignIn } from "@/firebase/non-blocking-login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Droplet, LogIn, UserPlus, Ghost, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/firebase"
import { useEffect } from "react"

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
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="mb-8 text-center space-y-2">
        <div className="inline-flex p-4 bg-primary/20 rounded-3xl mb-4">
          <Droplet className="w-12 h-12 text-primary fill-current" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white">HydroTrack</h1>
        <p className="text-muted-foreground font-medium">Your intelligent hydration partner.</p>
      </div>

      <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-xl rounded-[2rem] shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-white">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Join the community and track your health." : "Sign in to access your hydration history."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/10 border-white/10 text-white placeholder:text-white/30 h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/10 border-white/10 text-white h-12 rounded-xl"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-background font-bold text-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : (isSignUp ? <UserPlus className="w-5 h-5 mr-2" /> : <LogIn className="w-5 h-5 mr-2" />)}
              {isSignUp ? "Sign Up" : "Sign In"}
            </Button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-muted-foreground font-bold">Or continue as</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold"
            onClick={handleGuest}
            disabled={loading}
          >
            <Ghost className="w-5 h-5 mr-2" /> Continue as Guest
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            variant="link" 
            className="text-primary font-bold" 
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
