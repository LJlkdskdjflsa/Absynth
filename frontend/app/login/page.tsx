"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Fingerprint, Key, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useWallet } from "../providers/wallet-provider"
import { toast } from "sonner"

const validateUsername = (username: string | null | undefined) => {
  if (!username) {
    return "Username is required"
  }
  if (username.length < 5 || username.length > 50) {
    return "Username must be between 5 and 50 characters"
  }
  if (!/^[a-zA-Z0-9_@.:+-]+$/.test(username)) {
    return "Username can only contain letters, numbers, and _@.:+- characters"
  }
  return null
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const router = useRouter()
  const { account, handlePasskeyLogin, handleCreateAccount } = useWallet()

  const onPasskeyLogin = async () => {
    setLoading(true)
    try {
      await handlePasskeyLogin()
      toast.success("Successfully logged in!")
      router.push("/")
    } catch (error) {
      console.error("Login failed:", error)
      toast.error("Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const onCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUsernameError(null)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('name') as string
    
    const error = validateUsername(username)
    if (error) {
      setUsernameError(error)
      return
    }

    setLoading(true)
    try {
      await handleCreateAccount(username)
      toast.success("Account created successfully!")
      router.push("/")
    } catch (error) {
      console.error("Account creation failed:", error)
      toast.error("Account creation failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (account) {
    router.push("/")
    return null
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to CharityChain</CardTitle>
          <CardDescription>Login or create an account to start donating</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Create Account</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Button onClick={onPasskeyLogin} className="w-full justify-start gap-2" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                  Login with Passkey
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="register" className="mt-4">
              <form onSubmit={onCreateAccount} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <Input 
                    id="name" 
                    name="name"
                    placeholder="Enter your username (5-50 characters)" 
                    required
                    minLength={5}
                    maxLength={50}
                    pattern="[a-zA-Z0-9_@.:+-]+"
                    onChange={(e) => {
                      const error = validateUsername(e.target.value)
                      setUsernameError(error)
                    }}
                    className={usernameError ? "border-red-500" : ""}
                  />
                  {usernameError && (
                    <p className="text-sm text-red-500">{usernameError}</p>
                  )}
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading || !!usernameError}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  Create Account with Passkey
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-xs text-center text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

