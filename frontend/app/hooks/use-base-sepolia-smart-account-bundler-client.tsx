"use client"

import { createBundlerClient } from 'viem/account-abstraction'
import { toModularTransport } from '@circle-fin/modular-wallets-core'
import { baseSepolia } from 'viem/chains'

const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY as string
const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL as string

export function useBaseSepoliaSmartAccountBundlerClient() {
    const modularTransport = toModularTransport(`${CLIENT_URL}/baseSepolia`, CLIENT_KEY)

    // const client = createPublicClient({
    //     chain: arbitrumSepolia,
    //     transport: modularTransport,
    // })

    const bundlerClient = createBundlerClient({
        chain: baseSepolia,
        transport: modularTransport,
    })

    return {
        // client,
        bundlerClient
    }
}