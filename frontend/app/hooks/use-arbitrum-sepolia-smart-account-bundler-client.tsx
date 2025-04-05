"use client"

import { arbitrumSepolia } from 'viem/chains'
import { toModularTransport } from '@circle-fin/modular-wallets-core'
import { createBundlerClient } from 'viem/account-abstraction'

const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY as string
const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL as string

export function useArbitrumSepoliaSmartAccountBundlerClient() {
    const modularTransport = toModularTransport(`${CLIENT_URL}/arbitrumSepolia`, CLIENT_KEY)

    // const client = createPublicClient({
    //     chain: arbitrumSepolia,
    //     transport: modularTransport,
    // })

    const bundlerClient = createBundlerClient({
        chain: arbitrumSepolia,
        transport: modularTransport,
    })

    return {
        // client,
        bundlerClient
    }
}