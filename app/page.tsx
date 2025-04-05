"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Wallet, Heart, History } from "lucide-react"
import CharityBanner from "./components/charity-banner"
import { useState } from 'react'
import { donate } from './services/donation'
import { Notification } from './components/notification'
import { useWallet } from './providers/wallet-provider'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <CharityBanner />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <CharityCard
                id="1"
                title="Clean Water Initiative"
                description="Providing clean water to communities in need around the world."
                raised={12500}
                goal={25000}
                organizationAddress="0x9a3f63F053512597d486cA679Ce5A0D13b98C8db"
              />
              <CharityCard
                id="2"
                title="Education for All"
                description="Supporting education programs for underprivileged children."
                raised={18750}
                goal={30000}
                organizationAddress="0xec838E7f89CE1CF0dB482c963946b5D827964ddE"
              />
              <CharityCard
                id="3"
                title="Hunger Relief Program"
                description="Distributing food to families facing food insecurity."
                raised={8200}
                goal={15000}
                organizationAddress="0x046734b1888358760cFE4C45601eb0EdD0aa174D"
              />
              <CharityCard
                id="4"
                title="Wildlife Conservation"
                description="Protecting endangered species and their natural habitats."
                raised={21300}
                goal={40000}
                organizationAddress="0x03dF76C8c30A88f424CF3CBBC36A1Ca02763103b"
              />
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

interface CharityCardProps {
  id: string
  title: string
  description: string
  raised: number
  goal: number
  organizationAddress: string
}

function CharityCard({ id, title, description, raised, goal, organizationAddress }: CharityCardProps) {
  const { account } = useWallet()
  const [notificationState, setNotificationState] = useState<{
    success?: boolean;
    error?: string;
  }>({})

  const progress = (raised / goal) * 100

  const handleDonate = async () => {
    if (!account) {
      setNotificationState({ 
        error: 'Please connect your wallet first' 
      })
      return
    }
    
    try {
      const result = await donate(account, organizationAddress, 1) // 1 USDC donation
      
      if (result.success) {
        setNotificationState({ success: true })
        // You can also store or display the explorer URL: result.explorerUrl
        console.log('Transaction URL:', result.explorerUrl)
      } else {
        setNotificationState({ error: result.error })
      }
    } catch (error) {
      setNotificationState({ 
        error: error instanceof Error ? error.message : 'Failed to process donation' 
      })
    }
  }

  return (
    <>
      <Notification 
        success={notificationState.success}
        error={notificationState.error}
        onClose={() => setNotificationState({})}
      />
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
          <img
            src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(title)}`}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
          </div>
        </div>
        <CardContent className="p-4">
          <p className="mb-4 text-sm text-muted-foreground">{description}</p>
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-sm">
              <span>Raised: ${raised.toLocaleString()}</span>
              <span>Goal: ${goal.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div className="h-full bg-green-500" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <Button className="w-full" onClick={handleDonate}>
            Donate
          </Button>
        </CardContent>
      </Card>
    </>
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