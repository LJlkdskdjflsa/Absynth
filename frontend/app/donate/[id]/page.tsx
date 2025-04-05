"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2, Heart, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CHARITIES, type CharityKey } from "@/app/config/charity-list"
import { useWallet } from "@/app/providers/wallet-provider"
import { donate } from "@/app/services/donation"
import { toast } from "sonner"

export default function DonatePage({ params }: { params: { id: string } }) {
  const { id } = params
  const { account, balance, refreshBalance } = useWallet()
  const [amount, setAmount] = useState("")
  const [donationMethod, setDonationMethod] = useState("wallet")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const charity = CHARITIES[id as CharityKey]
  const numericBalance = Number(balance)

  if (!charity) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Charity Not Found</CardTitle>
            <CardDescription>The charity you are looking for does not exist.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/">
              <Button>Return to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const handleDonate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!account || !amount) return

    setLoading(true)
    try {
      const result = await donate(account, charity.organizationAddress, Number(amount))

      if (result.success) {
        await refreshBalance()
        setSuccess(true)
      } else {
        toast.error(result.error || "Donation failed")
      }
    } catch (error) {
      console.error("Donation error:", error)
      toast.error("Failed to process donation")
    } finally {
      setLoading(false)
    }
  }

  const handleReturn = () => {
    router.push("/")
  }

  if (success) {
    return (
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle className="text-2xl">Thank You!</CardTitle>
            <CardDescription>
              Your donation of {amount} USDC to {charity.title} has been processed successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4 text-sm text-muted-foreground">Your generosity helps make a difference in the world.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={handleReturn} className="w-full">
              Return to Home
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">{charity.title}</CardTitle>
          <CardDescription>{charity.description}</CardDescription>
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-sm">
              <span>Progress</span>
              <span>{((charity.raised / charity.goal) * 100).toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${(charity.raised / charity.goal) * 100}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <span>{charity.raised.toLocaleString()} USDC raised</span>
              <span>Goal: {charity.goal.toLocaleString()} USDC</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDonate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Donation Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="10.00"
                min="1"
                max={donationMethod === "wallet" ? numericBalance : undefined}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              {donationMethod === "wallet" && (
                <p className="text-xs text-muted-foreground">
                  Available balance: {numericBalance.toFixed(2)} USDC
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Donation Method</Label>
              <RadioGroup value={donationMethod} onValueChange={setDonationMethod} className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="wallet" id="wallet" />
                  <Label htmlFor="wallet">Wallet Balance</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deposit" id="deposit" />
                  <Label htmlFor="deposit">New Deposit</Label>
                </div>
              </RadioGroup>
            </div>

            {donationMethod === "deposit" && (
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-medium">Deposit Information</h3>
                <p className="mb-4 text-xs text-muted-foreground">Send USDC to the following address:</p>
                <div className="mb-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs font-mono">
                  {account?.address || 'Not connected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Your donation will be processed once the deposit is confirmed.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !amount || (donationMethod === "wallet" && Number(amount) > numericBalance)}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
              Donate {amount ? `${amount} USDC` : ""}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

