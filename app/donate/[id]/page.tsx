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

const charities = {
  "1": {
    title: "Clean Water Initiative",
    description: "Providing clean water to communities in need around the world.",
    raised: 12500,
    goal: 25000,
    image: "/placeholder.svg?height=200&width=400&text=Clean%20Water%20Initiative",
  },
  "2": {
    title: "Education for All",
    description: "Supporting education programs for underprivileged children.",
    raised: 18750,
    goal: 30000,
    image: "/placeholder.svg?height=200&width=400&text=Education%20for%20All",
  },
  "3": {
    title: "Hunger Relief Program",
    description: "Distributing food to families facing food insecurity.",
    raised: 8200,
    goal: 15000,
    image: "/placeholder.svg?height=200&width=400&text=Hunger%20Relief%20Program",
  },
  "4": {
    title: "Wildlife Conservation",
    description: "Protecting endangered species and their natural habitats.",
    raised: 21300,
    goal: 40000,
    image: "/placeholder.svg?height=200&width=400&text=Wildlife%20Conservation",
  },
}

export default function DonatePage({ params }) {
  const { id } = params
  const charity = charities[id]
  const [amount, setAmount] = useState("")
  const [donationMethod, setDonationMethod] = useState("wallet")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

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

  const handleDonate = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate donation process
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setSuccess(true)
    } catch (error) {
      console.error("Donation failed:", error)
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
      <Card className="w-full max-w-md overflow-hidden">
        <div className="relative h-48 w-full">
          <img src={charity.image || "/placeholder.svg"} alt={charity.title} className="h-full w-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-lg font-semibold text-white">{charity.title}</h3>
          </div>
        </div>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle>{charity.title}</CardTitle>
              <CardDescription>{charity.description}</CardDescription>
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
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
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
                  0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t
                </div>
                <p className="text-xs text-muted-foreground">
                  Your donation will be processed once the deposit is confirmed.
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading || !amount}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Heart className="mr-2 h-4 w-4" />}
              Donate {amount ? `${amount} USDC` : ""}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

