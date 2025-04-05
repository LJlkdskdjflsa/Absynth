"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { useWallet } from "../providers/wallet-provider"
import { toast } from "sonner"

export default function Header() {
  const { account } = useWallet()
  const [copied, setCopied] = useState(false)

  const copyAddress = async () => {
    if (!account?.address) return
    await navigator.clipboard.writeText(account.address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success("Address copied to clipboard!")
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-xl font-bold">
          CharityChain
        </Link>
        <div className="flex items-center gap-4">
          {account ? (
            <Button
              onClick={copyAddress}
              className="font-mono"
              variant="outline"
              size="sm"
            >
              {account.address.slice(0, 6)}...{account.address.slice(-4)}
              {copied ? (
                <Check className="ml-2 h-4 w-4" />
              ) : (
                <Copy className="ml-2 h-4 w-4" />
              )}
            </Button>
          ) : (
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
          )}
          <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
            <span className="text-sm font-medium">USDC</span>
            <span className="font-medium">50.04</span>
          </div>
        </div>
      </div>
    </header>
  )
} 