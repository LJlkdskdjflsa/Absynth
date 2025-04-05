"use client"

import { v4 as uuidv4 } from 'uuid'
import { type Hex, createPublicClient, parseUnits, encodeFunctionData } from 'viem'
import { arbitrumSepolia } from 'viem/chains'
import { toModularTransport } from '@circle-fin/modular-wallets-core'
import { createBundlerClient } from 'viem/account-abstraction'
import axios from 'axios'
import { USDC_CONTRACT_ADDRESS } from '../constants'

// Constants
const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY as string
const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL as string
const POLICY_ENGINE_API_KEY = process.env.NEXT_PUBLIC_CIRCLE_POLICY_ENGINE_API_KEY as string

// ERC20 ABI for transfer function
const ERC20_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function'
  }
] as const

// Create Circle transport and clients
const modularTransport = toModularTransport(`${CLIENT_URL}/arbitrumSepolia`, CLIENT_KEY)

const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: modularTransport,
})

const bundlerClient = createBundlerClient({
  chain: arbitrumSepolia,
  transport: modularTransport,
})

interface DonationResult {
  success: boolean
  error?: string
  transactionHash?: Hex
  explorerUrl?: string
}

export async function donate(
  account: any,
  organizationAddress: string,
  amount: number
): Promise<DonationResult> {
  try {
    // Screen the organization address
    console.log("Organization address", organizationAddress)
    const screeningResult = await screenAddress(organizationAddress)
    const screeningData = screeningResult.data.data || screeningResult.data
    console.log("Screening result", screeningData)

    if (screeningData?.result === 'DENIED') {
      return {
        success: false,
        error: `Organization address is not valid: ${screeningData.decision?.ruleName || 'compliance rules'}`
      }
    }

    // Create transfer function data for USDC (with 6 decimals)
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [organizationAddress as `0x${string}`, parseUnits(amount.toString(), 6)]
    })
    console.log("Data", data)

    // Send the user operation
    console.log("Sending user operation...")
    const hash = await bundlerClient.sendUserOperation({
      account,
      calls: [
        {
          to: USDC_CONTRACT_ADDRESS,
          data
        },
      ],
      paymaster: true,
      maxPriorityFeePerGas: BigInt(4762500),
    })
    console.log("User operation hash:", hash)

    // Wait for the transaction receipt with timeout and retry
    console.log("Waiting for transaction receipt...")
    let receipt
    try {
      const result = await Promise.race([
        bundlerClient.waitForUserOperationReceipt({
          hash,
          timeout: 30000, // 30 seconds timeout
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Transaction confirmation timeout')), 30000)
        )
      ]) as { receipt: any }
      receipt = result.receipt
    } catch (error) {
      console.error("Error waiting for receipt:", error)
      throw new Error('Transaction may have been sent but confirmation timed out. Please check your wallet for status.')
    }

    console.log("Transaction confirmed! Receipt:", receipt)
    return {
      success: true,
      transactionHash: receipt.transactionHash,
      explorerUrl: `https://sepolia.arbiscan.io/tx/${receipt.transactionHash}`
    }
  } catch (error) {
    console.error('Donation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred during donation'
    }
  }
}

async function screenAddress(address: string) {
  const options = {
    method: 'POST',
    url: 'https://api.circle.com/v1/w3s/compliance/screening/addresses',
    headers: {
      Authorization: `Bearer ${POLICY_ENGINE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    data: {
      idempotencyKey: uuidv4(),
      address: address,
      chain: 'ETH-SEPOLIA',
    },
  }

  return axios.request(options)
} 