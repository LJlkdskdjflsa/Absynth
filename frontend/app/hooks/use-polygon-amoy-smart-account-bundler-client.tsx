"use client"

import { createBundlerClient } from 'viem/account-abstraction'
import { toModularTransport } from '@circle-fin/modular-wallets-core'
import { polygonAmoy } from 'viem/chains'

const CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY as string
const CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL as string

export function usePolygonAmoySmartAccountBundlerClient() {
    const modularTransport = toModularTransport(`${CLIENT_URL}/polygonAmoy`, CLIENT_KEY)

    const bundlerClient = createBundlerClient({
        chain: polygonAmoy,
        transport: modularTransport,
    })

    return {
        bundlerClient
    }
} 