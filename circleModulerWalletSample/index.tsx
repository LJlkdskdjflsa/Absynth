import * as React from 'react'
import * as ReactDOM from 'react-dom/client'
import { polygonAmoy, arbitrumSepolia } from 'viem/chains'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

import { type Hex, createPublicClient, parseEther, parseUnits, encodeFunctionData } from 'viem'
import {
  type P256Credential,
  type SmartAccount,
  WebAuthnAccount,
  createBundlerClient,
  toWebAuthnAccount,
} from 'viem/account-abstraction'
import {
  WebAuthnMode,
  toCircleSmartAccount,
  toModularTransport,
  toPasskeyTransport,
  toWebAuthnCredential,
} from '@circle-fin/modular-wallets-core'

const clientKey = import.meta.env.VITE_CLIENT_KEY as string
const clientUrl = import.meta.env.VITE_CLIENT_URL as string
const policyEngineApiKey = import.meta.env.VITE_POLICY_ENGINE_API_KEY as string
// USDC contract address on Arbitrum Sepolia
const USDC_CONTRACT_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d' as const

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

// Create Circle transports
const passkeyTransport = toPasskeyTransport(clientUrl, clientKey)
const modularTransport = toModularTransport(`${clientUrl}/arbitrumSepolia`, clientKey)

// Create a public client
const client = createPublicClient({
  chain: arbitrumSepolia,
  transport: modularTransport,
})

// Create a bundler client
const bundlerClient = createBundlerClient({
  chain: arbitrumSepolia,
  transport: modularTransport,
})

// Interface for screening response
interface ScreeningResponse {
  result: 'APPROVED' | 'DENIED';
  decision?: {
    ruleName: string;
    actions: string[];
    reasons: Array<{
      source: string;
      sourceValue: string;
      riskScore: string;
      riskCategories: string[];
      type: string;
    }>;
    screeningDate: string;
  };
  address: string;
  chain: string;
}

function Example() {
  const [account, setAccount] = React.useState<SmartAccount>()
  const [credential, setCredential] = React.useState<P256Credential>(() =>
    JSON.parse(localStorage.getItem('credential') || 'null'),
  )
  const [username, setUsername] = React.useState<string | undefined>(() => localStorage.getItem("username") || undefined)
  const [screeningResult, setScreeningResult] = React.useState<string>('')
  const [screeningDetails, setScreeningDetails] = React.useState<string>('')

  const [hash, setHash] = React.useState<Hex>()
  const [userOpHash, setUserOpHash] = React.useState<Hex>()

  React.useEffect(() => {
    if (!credential) return

    // Create a circle smart account
    toCircleSmartAccount({
      client,
      owner: toWebAuthnAccount({ credential }) as WebAuthnAccount,
      name: username,
    }).then(setAccount)
  }, [credential])

  const register = async () => {
    const username = (document.getElementById('username') as HTMLInputElement).value
    const credential = await toWebAuthnCredential({
      transport: passkeyTransport,
      mode: WebAuthnMode.Register,
      username,
    })
    localStorage.setItem('credential', JSON.stringify(credential))
    localStorage.setItem('username', username)
    setCredential(credential)
    setUsername(username)
  }

  const login = async () => {
    const credential = await toWebAuthnCredential({
      transport: passkeyTransport,
      mode: WebAuthnMode.Login,
    })
    localStorage.setItem('credential', JSON.stringify(credential))
    setCredential(credential)
  }

  const screenAddress = (address: string) => {
    const options = {
      method: 'POST',
      url: 'https://api.circle.com/v1/w3s/compliance/screening/addresses',
      headers: {
        Authorization: `Bearer ${policyEngineApiKey}`,
        'Content-Type': 'application/json',
      },
      data: {
        idempotencyKey: uuidv4(),
        address: address,
        chain: 'ETH-SEPOLIA',
      },
    }

    const response = axios.request(options)
    return response
  }

  const sendUserOperation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!account) return

    const formData = new FormData(event.currentTarget)
    const to = formData.get('to') as `0x${string}`

    // Directly get the screening result from the axios request
    const result = await screenAddress(to)
   
    console.log("Screening result", result)
    const screeningData = result.data.data || result.data;
    if (screeningData?.result === 'DENIED') {
      alert(`Transaction cancelled: Address is DENIED due to ${screeningData.decision?.ruleName || 'compliance rules'}.`);
      return;
    }

    // Create transfer function data for 1 USDC (with 6 decimals)
    const data = encodeFunctionData({
      abi: ERC20_ABI,
      functionName: 'transfer',
      args: [to, parseUnits('1', 6)]
    })

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
    setUserOpHash(hash)
    const { receipt } = await bundlerClient.waitForUserOperationReceipt({
      hash,
    })
    setHash(receipt.transactionHash)
  }

  if (!credential)
    return (
      <>
        <input id="username" name="username" placeholder="Username" />
        <br />
        <button onClick={register}>Register</button>
        <button onClick={login}>Login</button>
      </>
    )
  if (!account) return <p>Loading...</p>

  return (
    <>
      <h2>Account</h2>
      <p>Address: {account?.address}</p>

      <h2>Send 1 USDC</h2>
      <form onSubmit={sendUserOperation}>
        <input name="to" placeholder="Recipient Address" />
        <button type="submit">Send 1 USDC</button>
        {screeningResult && (
          <div>
            <p>Screening Result: {screeningResult}</p>
            <pre>{screeningDetails}</pre>
          </div>
        )}
        {userOpHash && <p>User Operation Hash: {userOpHash}</p>}
        {hash && <p>Transaction Hash: {hash}</p>}
      </form>

      <h3>Test Addresses for Screening:</h3>
      <ul style={{ fontSize: '0.9em' }}>
        <li>Sanctions Blocklist: address ending in 9999</li>
        <li>Frozen User Wallet: address ending in 8888</li>
        <li>Custom Blocklist: address ending in 7777</li>
        <li>Severe Sanctions Risk: address ending in 8999</li>
        <li>Severe Terrorist Financing: address ending in 8899</li>
        <li>Severe CSAM Risk: address ending in 8889</li>
        <li>Severe Illicit Behavior: address ending in 7779</li>
        <li>High Illicit Behavior Risk: address ending in 7666</li>
        <li>High Gambling Risk: address ending in 7766</li>
      </ul>
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Example />,
)
