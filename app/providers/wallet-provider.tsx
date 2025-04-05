"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createPublicClient } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { WebAuthnAccount, toWebAuthnAccount } from 'viem/account-abstraction'
import { WebAuthnMode, toCircleSmartAccount, toModularTransport, toPasskeyTransport, toWebAuthnCredential } from '@circle-fin/modular-wallets-core'

// Circle wallet configuration
const clientKey = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY as string
const clientUrl = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL as string

// Create Circle transports
const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
const modularTransport = toModularTransport(`${clientUrl}/arbitrumSepolia`, clientKey)

// Create a public client
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: modularTransport,
})

type WalletContextType = {
  account: any | null
  loading: boolean
  credential: any | null
  username: string | undefined
  handlePasskeyLogin: () => Promise<void>
  handleCreateAccount: (username: string) => Promise<void>
  disconnect: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [credential, setCredential] = useState(() => {
    if (typeof window !== 'undefined') {
      return JSON.parse(localStorage.getItem('credential') || 'null')
    }
    return null
  })
  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('username') || undefined
    }
    return undefined
  })
  const [account, setAccount] = useState<any>(null)

  useEffect(() => {
    if (!credential) return

    // Create a circle smart account
    toCircleSmartAccount({
      client,
      owner: toWebAuthnAccount({ credential }),
      name: username,
    }).then(setAccount)
  }, [credential])

  const handlePasskeyLogin = async () => {
    setLoading(true)

    try {
      const credential = await toWebAuthnCredential({
        transport: passkeyTransport,
        mode: WebAuthnMode.Login,
      })
      localStorage.setItem('credential', JSON.stringify(credential))
      setCredential(credential)
    } catch (error) {
      console.error("Login failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async (username: string) => {
    setLoading(true)

    try {
      const credential = await toWebAuthnCredential({
        transport: passkeyTransport,
        mode: WebAuthnMode.Register,
        username,
      })
      localStorage.setItem('credential', JSON.stringify(credential))
      localStorage.setItem('username', username)
      setCredential(credential)
      setUsername(username)
    } catch (error) {
      console.error("Account creation failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const disconnect = () => {
    localStorage.removeItem('credential')
    localStorage.removeItem('username')
    setCredential(null)
    setUsername(undefined)
    setAccount(null)
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        loading,
        credential,
        username,
        handlePasskeyLogin,
        handleCreateAccount,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 