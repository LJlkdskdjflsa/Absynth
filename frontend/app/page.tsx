"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield, Wallet, Heart, History } from "lucide-react"
import CharityBanner from "./components/charity-banner"
import { CharityCard } from "./components/charity-card"
import { CHARITIES } from "./config/charity-list"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <CharityBanner />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {Object.values(CHARITIES).map((charity) => (
                <CharityCard
                  key={charity.id}
                  {...charity}
                  crossChainDonation={charity.crossChainDonation}
                />
              ))}
            </div>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityItem type="donation" amount={10} charity="Clean Water Initiative" time="2 hours ago" />
                  <ActivityItem type="deposit" amount={50} time="1 day ago" />
                  <ActivityItem type="validation" status="completed" time="1 day ago" />
                  <ActivityItem type="wallet" action="created" time="1 day ago" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  View All Activity
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

interface ActivityItemProps {
  type: "donation" | "deposit" | "validation" | "wallet"
  amount?: number
  charity?: string
  status?: string
  action?: string
  time: string
}

function ActivityItem({ type, amount, charity, status, action, time }: ActivityItemProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        {type === "donation" && <Heart className="h-4 w-4" />}
        {type === "deposit" && <Wallet className="h-4 w-4" />}
        {type === "validation" && <Shield className="h-4 w-4" />}
        {type === "wallet" && <Wallet className="h-4 w-4" />}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">
          {type === "donation" && `Donated ${amount} USDC to ${charity}`}
          {type === "deposit" && `Deposited ${amount} USDC to wallet`}
          {type === "validation" && `Identity validation ${status}`}
          {type === "wallet" && `Wallet ${action}`}
        </p>
        <p className="text-xs text-muted-foreground">{time}</p>
      </div>
    </div>
  )
}