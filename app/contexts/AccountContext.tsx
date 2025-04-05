"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { type P256Credential, type SmartAccount, WebAuthnAccount } from 'viem/account-abstraction'
import { WebAuthnMode, toCircleSmartAccount, toPasskeyTransport, toWebAuthnCredential } from '@circle-fin/modular-wallets-core'
import { createPublicClient } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { toModularTransport } from '@circle-fin/modular-wallets-core'

const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY as string
const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL as string

// Create Circle transports
const passkeyTransport = toPasskeyTransport(CLIENT_URL, CLIENT_KEY)
const modularTransport = toModularTransport(`${CLIENT_URL}/arbitrumSepolia`, CLIENT_KEY)

// Create a public client
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: modularTransport,
})

interface AccountContextType {
  account: SmartAccount | undefined
  credential: P256Credential | null
  username: string | undefined
  register: (username: string) => Promise<void>
  login: () => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AccountContext = createContext<AccountContextType | undefined>(undefined)

export function AccountProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<SmartAccount>()
  const [credential, setCredential] = useState<P256Credential | null>(() =>
    typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('credential') || 'null') : null
  )
  const [username, setUsername] = useState<string | undefined>(() =>
    typeof window !== 'undefined' ? localStorage.getItem('username') || undefined : undefined
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!credential) return

    // Create a circle smart account
    toCircleSmartAccount({
      client,
      owner: toWebAuthnAccount({ credential }) as WebAuthnAccount,
      name: username,
    }).then(setAccount)
  }, [credential, username])

  const register = async (newUsername: string) => {
    setIsLoading(true)
    try {
      const credential = await toWebAuthnCredential({
        transport: passkeyTransport,
        mode: WebAuthnMode.Register,
        username: newUsername,
      })
      localStorage.setItem('credential', JSON.stringify(credential))
      localStorage.setItem('username', newUsername)
      setCredential(credential)
      setUsername(newUsername)
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const login = async () => {
    setIsLoading(true)
    try {
      const credential = await toWebAuthnCredential({
        transport: passkeyTransport,
        mode: WebAuthnMode.Login,
      })
      localStorage.setItem('credential', JSON.stringify(credential))
      setCredential(credential)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('credential')
    localStorage.removeItem('username')
    setCredential(null)
    setUsername(undefined)
    setAccount(undefined)
  }

  return (
    <AccountContext.Provider
      value={{
        account,
        credential,
        username,
        register,
        login,
        logout,
        isLoading
      }}
    >
      {children}
    </AccountContext.Provider>
  )
}

export function useAccount() {
  const context = useContext(AccountContext)
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider')
  }
  return context
} 