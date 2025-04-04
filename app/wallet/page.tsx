"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Copy, CheckCircle, Loader2, Heart } from "lucide-react"
import Link from "next/link"

export default function WalletPage() {
  const [copied, setCopied] = useState(false)
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [loading, setLoading] = useState(false)

  const walletAddress = "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t"
  const balance = 50.04

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDeposit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate deposit process
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setDepositAmount("")
      // In a real app, you would update the balance here
    } catch (error) {
      console.error("Deposit failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate withdrawal process
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setWithdrawAmount("")
      // In a real app, you would update the balance here
    } catch (error) {
      console.error("Withdrawal failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Wallet</h1>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Wallet Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-center">
                <div className="text-3xl font-bold">{balance.toFixed(2)} USDC</div>
                <div className="text-sm text-muted-foreground">Available for donations</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="mb-2 flex items-center justify-between">
                  <Label className="text-sm font-medium">Your Wallet Address</Label>
                  <Button variant="ghost" size="sm" className="h-8 gap-1 text-xs" onClick={copyToClipboard}>
                    {copied ? (
                      <>
                        <CheckCircle className="h-3 w-3" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
                <div className="overflow-x-auto rounded bg-gray-100 p-2 text-xs font-mono">{walletAddress}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Manage Funds</CardTitle>
              <CardDescription>Deposit or withdraw USDC from your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="deposit">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                </TabsList>
                <TabsContent value="deposit" className="mt-4 space-y-4">
                  <form onSubmit={handleDeposit}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="depositAmount">Amount (USDC)</Label>
                        <Input
                          id="depositAmount"
                          type="number"
                          placeholder="10.00"
                          min="1"
                          step="0.01"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="rounded-lg border p-4">
                        <h3 className="mb-2 text-sm font-medium">Deposit Instructions</h3>
                        <p className="mb-4 text-xs text-muted-foreground">Send USDC to your wallet address:</p>
                        <div className="mb-2 overflow-x-auto rounded bg-gray-100 p-2 text-xs font-mono">
                          {walletAddress}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Your balance will be updated once the transaction is confirmed.
                        </p>
                      </div>
                      <Button type="submit" className="w-full gap-2" disabled={loading || !depositAmount}>
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowDownToLine className="h-4 w-4" />
                        )}
                        Deposit Funds
                      </Button>
                    </div>
                  </form>
                </TabsContent>
                <TabsContent value="withdraw" className="mt-4 space-y-4">
                  <form onSubmit={handleWithdraw}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="withdrawAmount">Amount (USDC)</Label>
                        <Input
                          id="withdrawAmount"
                          type="number"
                          placeholder="10.00"
                          min="1"
                          max={balance}
                          step="0.01"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="withdrawAddress">Destination Address</Label>
                        <Input id="withdrawAddress" placeholder="0x..." required />
                      </div>
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={loading || !withdrawAmount || Number(withdrawAmount) > balance}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <ArrowUpFromLine className="h-4 w-4" />
                        )}
                        Withdraw Funds
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Recent deposits, withdrawals, and donations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <TransactionItem
                  type="donation"
                  amount={10}
                  destination="Clean Water Initiative"
                  date="Apr 4, 2025"
                  time="3:15 PM"
                />
                <TransactionItem
                  type="deposit"
                  amount={50}
                  source="External Wallet"
                  date="Apr 3, 2025"
                  time="10:22 AM"
                />
                <TransactionItem
                  type="withdrawal"
                  amount={5}
                  destination="External Wallet"
                  date="Apr 1, 2025"
                  time="2:45 PM"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Transactions
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

function TransactionItem({ type, amount, source, destination, date, time }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="flex items-center gap-3">
        <div
          className={`rounded-full p-2 ${
            type === "deposit" ? "bg-green-100" : type === "withdrawal" ? "bg-orange-100" : "bg-blue-100"
          }`}
        >
          {type === "deposit" && <ArrowDownToLine className={`h-4 w-4 text-green-600`} />}
          {type === "withdrawal" && <ArrowUpFromLine className={`h-4 w-4 text-orange-600`} />}
          {type === "donation" && <Heart className={`h-4 w-4 text-blue-600`} />}
        </div>
        <div>
          <div className="font-medium capitalize">{type}</div>
          <div className="text-xs text-muted-foreground">
            {type === "deposit" ? `From: ${source}` : `To: ${destination}`}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className={`font-medium ${type === "deposit" ? "text-green-600" : "text-red-600"}`}>
          {type === "deposit" ? "+" : "-"}
          {amount} USDC
        </div>
        <div className="text-xs text-muted-foreground">
          {date} at {time}
        </div>
      </div>
    </div>
  )
}

