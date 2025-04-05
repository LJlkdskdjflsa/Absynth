"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createPublicClient } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { toWebAuthnAccount } from 'viem/account-abstraction'
import { WebAuthnMode, toCircleSmartAccount, toModularTransport, toPasskeyTransport, toWebAuthnCredential } from '@circle-fin/modular-wallets-core'
import { USDC_CONTRACT_ADDRESS, USDC_ABI } from '../constants'

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
  balance: string
  handlePasskeyLogin: () => Promise<void>
  handleCreateAccount: (username: string) => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState('0')
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

  // Add effect to fetch balance when account changes
  useEffect(() => {
    if (account) {
      refreshBalance()
    } else {
      setBalance('0')
    }
  }, [account])

  const refreshBalance = async () => {
    if (!account) return

    try {
      const balance = await client.readContract({
        address: USDC_CONTRACT_ADDRESS,
        abi: USDC_ABI,
        functionName: 'balanceOf',
        args: [account.address]
      })
      
      // Convert from wei (6 decimals for USDC)
      setBalance((Number(balance) / 1e6).toString())
    } catch (error) {
      console.error('Error fetching balance:', error)
      setBalance('0')
    }
  }

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
        balance,
        handlePasskeyLogin,
        handleCreateAccount,
        disconnect,
        refreshBalance
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