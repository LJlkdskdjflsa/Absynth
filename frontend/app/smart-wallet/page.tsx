"use client"

import { useEffect, useState } from "react"
import {
  createWebAuthnCredential,
  P256Credential,
} from "viem/account-abstraction"
import { BASE_SEPOLIA_USDC_CONTRACT_ADDRESS, SMART_WALLET_CREDENTIAL } from "../constants"
import {
  type SmartAccountClient,
  createSmartAccountClient
} from "permissionless"
import {
  type ToKernelSmartAccountReturnType,
  toKernelSmartAccount
} from "permissionless/accounts"
import {
  entryPoint07Address,
  toWebAuthnAccount
} from "viem/account-abstraction"
import { Chain, createPublicClient, encodeFunctionData, getAddress, Hex, http, maxUint256, parseAbi, parseEther, parseUnits, Transport } from "viem"
import { createPimlicoClient } from "permissionless/clients/pimlico"
import { baseSepolia } from "viem/chains"
import { IERC20 } from "../abis/abi"
const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org")
})

const pimlicoClient = createPimlicoClient({
  chain: baseSepolia,
  transport: http(pimlicoUrl)
})

export default function PasskeysDemo() {

  const [smartAccountClient, setSmartAccountClient] = useState<SmartAccountClient<
    Transport,
    Chain,
    ToKernelSmartAccountReturnType<"0.7">
  >
  >()
  const [credential, setCredential] = useState<P256Credential | null>(null)
  const [txHash, setTxHash] = useState<Hex>()

  useEffect(() => {
    // Only access localStorage on the client side
    const savedCredential = localStorage.getItem(SMART_WALLET_CREDENTIAL)
    if (savedCredential) {
      setCredential(JSON.parse(savedCredential))
    }
  }, [])

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
    }).then((account: ToKernelSmartAccountReturnType<"0.7">) => {
      console.log("Smart account created", account)
      setSmartAccountClient(
        createSmartAccountClient({
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
      )
      console.log("Smart account client created", smartAccountClient)
    })
  }, [credential])

  const createCredential = async () => {
    const credential = await createWebAuthnCredential({
      name: "Smart Wallet"
    })
    console.log("Credential created", credential)
    localStorage.setItem(SMART_WALLET_CREDENTIAL, JSON.stringify(credential))
    setCredential(credential)
  }

  const sendUserOperation = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (!smartAccountClient) return

    const formData = new FormData(event.currentTarget)
    const to = formData.get("to") as `0x${string}`
    const amount = formData.get("value") as string

    // Create transfer function data for USDC (with 6 decimals)
    const data = encodeFunctionData({
      abi: IERC20,
      functionName: 'transfer',
      args: ["0x9a3f63F053512597d486cA679Ce5A0D13b98C8db", parseUnits(amount, 6)]
    })

    console.log("Sending user operation")

    const quotes = await pimlicoClient.getTokenQuotes({
      tokens: [BASE_SEPOLIA_USDC_CONTRACT_ADDRESS]
    })
    console.log("Quotes", quotes)
    const paymaster = quotes[0].paymaster

    console.log("Paymaster", paymaster)

    const txHash = await smartAccountClient.sendTransaction({
      calls: [
        {
          to: getAddress(BASE_SEPOLIA_USDC_CONTRACT_ADDRESS),
          abi: parseAbi(["function approve(address,uint)"]),
          functionName: "approve",
          args: [paymaster, maxUint256],
        },
        {
          to: BASE_SEPOLIA_USDC_CONTRACT_ADDRESS,
          data
        }
      ],
      paymasterContext: {
        token: BASE_SEPOLIA_USDC_CONTRACT_ADDRESS,
      }
    })
    setTxHash(txHash)
  }

  // const senderUsdcBalance = async () => {
  //   const senderUsdcBalance = await publicClient.readContract({
  //     abi: parseAbi(["function balanceOf(address account) returns (uint256)"]),
  //     address: BASE_SEPOLIA_USDC_CONTRACT_ADDRESS,
  //     functionName: "balanceOf",
  //     args: [smartAccountClient?.account.address],
  //   })
  //   return senderUsdcBalance
  // }

  // const checkUsdcBalance = async () => {
  //   const balance = await senderUsdcBalance();
  //   if (Number(balance) < 1_000_000) {
  //     throw new Error(
  //       `insufficient USDC balance for counterfactual wallet address ${smartAccountClient?.account.address}: ${Number(balance) / 1_000_000
  //       } USDC, required at least 1 USDC. Load up balance at https://faucet.circle.com/`
  //     )
  //   }
  // }

  // console.log("Smart account USDC balance: ", Number(senderUsdcBalance) / 1_000_000)

  if (!credential)
    return (
      <button type="button" onClick={createCredential}>
        Create credential
        <br />
        {smartAccountClient?.account.address}
      </button>
    )

  return (
    <div>
      <p>Credential: {credential.id}</p>
      <>
        <h2>Account</h2>
        <p>Address: {smartAccountClient?.account?.address}</p>

        <h2>Send User Operation</h2>
        <form onSubmit={sendUserOperation}>
          <input name="to" placeholder="Address" />
          <input name="value" placeholder="Amount (ETH)" />
          <button type="submit">Send</button>
          {txHash && <p>Transaction Hash: {txHash}</p>}
        </form>
      </>
    </div>
  )
}