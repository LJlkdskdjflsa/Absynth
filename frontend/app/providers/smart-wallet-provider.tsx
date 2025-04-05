"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createPublicClient, http, type Chain, Transport, parseAbi, getAddress, maxUint256, parseUnits, Hex } from 'viem'
import { baseSepolia } from 'viem/chains'
import { createPimlicoClient } from "permissionless/clients/pimlico"
import { type SmartAccountClient, createSmartAccountClient } from "permissionless"
import { type ToKernelSmartAccountReturnType, toKernelSmartAccount } from "permissionless/accounts"
import { entryPoint07Address, toWebAuthnAccount, createWebAuthnCredential, P256Credential } from "viem/account-abstraction"
import { BASE_SEPOLIA_USDC_CONTRACT_ADDRESS, SMART_WALLET_CREDENTIAL } from '../constants'
import { USDC_ABI } from '../constants'

// Pimlico configuration
const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

// Create clients
const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org")
})

const pimlicoClient = createPimlicoClient({
  chain: baseSepolia,
  transport: http(pimlicoUrl)
})

type WalletContextType = {
  account: ToKernelSmartAccountReturnType<"0.7"> | null
  smartAccountClient: SmartAccountClient<Transport, Chain, ToKernelSmartAccountReturnType<"0.7">> | null
  loading: boolean
  credential: P256Credential | null
  balance: string
  txHash: Hex | undefined
  handleCreateCredential: () => Promise<void>
  sendUserOperation: (event: React.FormEvent<HTMLFormElement>) => Promise<void>
  disconnect: () => void
  refreshBalance: () => Promise<void>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState('0')
  const [credential, setCredential] = useState<P256Credential | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SMART_WALLET_CREDENTIAL)
      return saved ? JSON.parse(saved) : null
    }
    return null
  })
  const [account, setAccount] = useState<ToKernelSmartAccountReturnType<"0.7"> | null>(null)
  const [smartAccountClient, setSmartAccountClient] = useState<SmartAccountClient<Transport, Chain, ToKernelSmartAccountReturnType<"0.7">> | null>(null)
  const [txHash, setTxHash] = useState<Hex>()

  // Set up smart account when credential changes
  useEffect(() => {
    if (!credential) return

    console.log("Creating smart account client")
    toKernelSmartAccount({
      client: publicClient,
      version: "0.3.1",
      owners: [toWebAuthnAccount({ credential })],
      entryPoint: {
        address: entryPoint07Address,
        version: "0.7"
      }
    }).then((account) => {
      console.log("Smart account created", account)
      setAccount(account)
      
      const client = createSmartAccountClient({
        account,
        paymaster: pimlicoClient,
        chain: baseSepolia,
        userOperation: {
          estimateFeesPerGas: async () =>
            (await pimlicoClient.getUserOperationGasPrice())
              .fast
        },
        bundlerTransport: http(pimlicoUrl)
      })
      
      setSmartAccountClient(client)
      console.log("Smart account client created", client)
    })
  }, [credential])

  // Refresh balance when account changes
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
      const balance = await publicClient.readContract({
        address: BASE_SEPOLIA_USDC_CONTRACT_ADDRESS,
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

  const handleCreateCredential = async () => {
    setLoading(true)

    try {
      const credential = await createWebAuthnCredential({
        name: "Smart Wallet"
      })
      console.log("Credential created", credential)
      localStorage.setItem(SMART_WALLET_CREDENTIAL, JSON.stringify(credential))
      setCredential(credential)
    } catch (error) {
      console.error("Credential creation failed:", error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const sendUserOperation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!smartAccountClient) return
    
    try {
      const quotes = await pimlicoClient.getTokenQuotes({
        tokens: [BASE_SEPOLIA_USDC_CONTRACT_ADDRESS]
      })
      console.log("Quotes", quotes)
      const paymaster = quotes[0].paymaster

      const hash = await smartAccountClient.sendTransaction({
        calls: [
          {
            to: getAddress(BASE_SEPOLIA_USDC_CONTRACT_ADDRESS),
            abi: parseAbi(["function approve(address,uint)"]),
            functionName: "approve",
            args: [paymaster, maxUint256],
          }
        ],
        paymasterContext: {
          token: BASE_SEPOLIA_USDC_CONTRACT_ADDRESS,
        }
      })
      setTxHash(hash)
      await refreshBalance()
    } catch (error) {
      console.error("Transaction failed:", error)
      throw error
    }
  }

  const disconnect = () => {
    localStorage.removeItem(SMART_WALLET_CREDENTIAL)
    setCredential(null)
    setAccount(null)
    setSmartAccountClient(null)
    setTxHash(undefined)
  }

  return (
    <WalletContext.Provider
      value={{
        account,
        smartAccountClient,
        loading,
        credential,
        balance,
        txHash,
        handleCreateCredential,
        sendUserOperation,
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
