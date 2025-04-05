"use client"

import { Shield, Wallet, Heart } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
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