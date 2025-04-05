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

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
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
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const username = formData.get('name') as string

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
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="john@example.com" required />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
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

