"use client"

import { useEffect } from 'react'
import { CheckCircle, XCircle } from 'lucide-react'

interface NotificationProps {
  success?: boolean
  error?: string
  onClose: () => void
}

export function Notification({ success, error, onClose }: NotificationProps) {
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        onClose()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, error, onClose])

  if (!success && !error) return null

  return (
    <div className="fixed right-4 top-4 z-50 animate-in fade-in slide-in-from-top-4">
      <div
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ${
          success ? 'bg-green-600' : 'bg-red-600'
        }`}
      >
        {success ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <span>
          {success
            ? 'Donation successful!'
            : error || 'An error occurred'}
        </span>
      </div>
    </div>
  )
} 