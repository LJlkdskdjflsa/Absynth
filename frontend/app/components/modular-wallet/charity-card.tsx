"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWallet } from '../../providers/modular-wallet-provider'
import { donate } from '../../services/donation'
import { crossChainDonate } from '../../services/crosschain-donation'
import { Notification } from '../notification'
import { Badge } from "@/components/ui/badge"
import ValidateModel from '../validate-model'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Loader2 } from "lucide-react"

export interface CharityCardProps {
  id: string
  title: string
  description: string
  raised: number
  goal: number
  organizationAddress: string
  crossChainDonation: boolean
}

export function CharityCard({ id, title, description, raised, goal, organizationAddress, crossChainDonation }: CharityCardProps) {
  const { account } = useWallet()
  const [notificationState, setNotificationState] = useState<{
    success?: boolean;
    error?: string;
  }>({})
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [isValidated, setIsValidated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const progress = (raised / goal) * 100

  const handleDonate = async () => {
    if (!account) {
      setNotificationState({
        error: 'Please connect your wallet first'
      })
      return
    }

    if (!isValidated) {
      setShowValidationModal(true)
      return
    }

    setIsLoading(true)
    try {
      let result;
      if (crossChainDonation) {
        console.log("Cross chain donation")
        await crossChainDonate(account, 1, organizationAddress); // 1 USDC donation
        result = { success: true };
      } else {
        console.log("Donating to", organizationAddress)
        result = await donate(account, organizationAddress, 1); // 1 USDC donation
      }

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
    } finally {
      setIsLoading(false)
    }
  }

  const handleValidationSuccess = () => {
    setIsValidated(true)
    setShowValidationModal(false)
    setTimeout(() => {
      handleDonate()
    }, 500)
  }

  return (
    <>
      <Notification
        success={notificationState.success}
        error={notificationState.error}
        onClose={() => setNotificationState({})}
      />
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Identity Verification Required</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex gap-8">
            <div className="w-1/2">
              <ValidateModel onSuccess={handleValidationSuccess} />
            </div>
            <div className="w-1/2 space-y-6">
              <div className="rounded-lg border p-6 bg-gray-50">
                <h3 className="text-lg font-semibold mb-4">Verification Requirements</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Age Requirement</h4>
                    <p className="text-sm text-gray-600">Must be 20 years or older to participate.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Nationality Restrictions</h4>
                    <p className="text-sm text-gray-600 mb-2">Cannot be a resident or citizen of the following countries:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                      <li>Iran</li>
                      <li>Iraq</li>
                      <li>North Korea</li>
                      <li>Russia</li>
                      <li>Syria</li>
                      <li>Venezuela</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="rounded-lg border p-6 bg-blue-50">
                <h3 className="text-lg font-semibold mb-2 text-blue-700">How to Verify</h3>
                <ol className="list-decimal list-inside text-sm text-blue-600 space-y-2">
                  <li>Scan the QR code with your mobile device</li>
                  <li>Follow the verification process</li>
                  <li>Wait for confirmation</li>
                  <li>Proceed with your donation</li>
                </ol>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <Card className="overflow-hidden">
        <div className="relative h-48 w-full">
          <img
            src={`/placeholder.svg?height=200&width=400&text=${encodeURIComponent(title)}`}
            alt={title}
            className="h-full w-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {crossChainDonation && (
                <Badge variant="secondary" className="bg-blue-500 text-white hover:bg-blue-600">
                  Cross Chain
                </Badge>
              )}
            </div>
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
          <Button className="w-full" onClick={handleDonate} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Donate'
            )}
          </Button>
        </CardContent>
      </Card>
    </>
  )
} 