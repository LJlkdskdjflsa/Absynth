"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from '../providers/wallet-provider'
import { donate } from '../services/donation'
import { Notification } from './notification'

export interface CharityCardProps {
  id: string
  title: string
  description: string
  raised: number
  goal: number
  organizationAddress: string
}

export function CharityCard({ id, title, description, raised, goal, organizationAddress }: CharityCardProps) {
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