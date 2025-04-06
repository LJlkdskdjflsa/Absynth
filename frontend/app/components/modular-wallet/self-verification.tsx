"use client"

import { useState, useEffect } from 'react'
import SelfQRcodeWrapper, { countries, SelfApp, SelfAppBuilder } from '@selfxyz/qrcode'
import { v4 as uuidv4 } from 'uuid'
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface SelfVerificationProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function SelfVerification({ isOpen, onClose, onSuccess }: SelfVerificationProps) {
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    setUserId(uuidv4())
  }, [])

  const [disclosures] = useState({
    // DG1 disclosures
    issuing_state: false,
    name: false,
    nationality: true,
    date_of_birth: false,
    passport_number: false,
    gender: false,
    expiry_date: false,
    // Custom checks
    minimumAge: 20,
    excludedCountries: [
      countries.IRAN,
      countries.IRAQ,
      countries.NORTH_KOREA,
      countries.RUSSIA,
      countries.SYRIAN_ARAB_REPUBLIC,
      countries.VENEZUELA
    ],
    ofac: true,
  })

  if (!userId) return null

  const selfApp = new SelfAppBuilder({
    appName: "Better World Donations",
    scope: "donation-verification",
    endpoint: "https://playground.self.xyz/api/verify",
    endpointType: "https",
    logoBase64: "https://i.imgur.com/Rz8B3s7.png",
    userId,
    disclosures: {
      ...disclosures,
      minimumAge: disclosures.minimumAge > 0 ? disclosures.minimumAge : undefined,
    },
    devMode: false,
  } as Partial<SelfApp>).build()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col items-center justify-center space-y-4">
          <SelfQRcodeWrapper
            selfApp={selfApp}
            onSuccess={() => {
              console.log('Verification successful')
              onSuccess()
            }}
            darkMode={false}
          />
          <p className="text-sm text-gray-500">
            User ID: {userId.substring(0, 8)}...
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 