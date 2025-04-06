"use client"

import { useEffect, useState } from "react"
import {
  createWebAuthnCredential,
  P256Credential,
} from "viem/account-abstraction"
import { ANY_CALLER, BASE_SEPOLIA_CCTP_TOKEN_MESSENGER, BASE_SEPOLIA_USDC_CONTRACT_ADDRESS, EHT_SEPOLIA_USDC_CONTRACT_ADDRESS, ETH_SEPOLIA_TRANSFER_HOOK, MIN_CCTP_FINALITY_THRESHOLD, MAX_CCTP_TRASFER_FEE, SMART_WALLET_CREDENTIAL, BASE_SEPOLIA_DOMAIN_ID } from "../constants"
import {
  type SmartAccountClient,
  createSmartAccountClient
} from "permissionless"
import { createPasskeyServerClient } from "permissionless/clients/passkeyServer"
import {
  type ToKernelSmartAccountReturnType,
  toKernelSmartAccount
} from "permissionless/accounts"
import {
  entryPoint07Address,
  toWebAuthnAccount
} from "viem/account-abstraction"
import { Chain, createPublicClient, encodeFunctionData, getAddress, Hex, http, maxUint256, parseAbi, parseUnits, Transport } from "viem"
import { createPimlicoClient } from "permissionless/clients/pimlico"
import { baseSepolia } from "viem/chains"
import { IERC20, ITokenMessenger } from "../abis/abi"
import { toBytes32 } from "../../utils/chainUtils"
import { retrieveAttestation } from "@/utils/cctpUtils"
import { getEthSepoliaHookContract } from "../contracts/sepolia-transaction-hook-contract copy"
const pimlicoUrl = `https://api.pimlico.io/v2/${baseSepolia.id}/rpc?apikey=${process.env.NEXT_PUBLIC_PIMLICO_API_KEY}`

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org")
})

const pimlicoClient = createPimlicoClient({
  chain: baseSepolia,
  transport: http(pimlicoUrl)
})

const passkeyServerClient = createPasskeyServerClient({
  chain: baseSepolia,
  transport: http(
    pimlicoUrl
  )
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

  const handleLogout = () => {
    localStorage.removeItem(SMART_WALLET_CREDENTIAL)
    setCredential(null)
    setSmartAccountClient(undefined)
    setTxHash(undefined)
  }

  const loginWithExistingCredential = async () => {
    const credentials = await passkeyServerClient.getCredentials(
      {
        context: {
          userName: "Smart Wallet"
        }
      }
    )

    // credentials is an array of credentials that match the userName
    setCredential(credentials[0])
    console.log("Credential", credentials[0])

    // local storage
    localStorage.setItem(SMART_WALLET_CREDENTIAL, JSON.stringify(credentials[0]))
  }

  // useEffect(() => {
  //   // Only access localStorage on the client side
  //   const savedCredential = localStorage.getItem(SMART_WALLET_CREDENTIAL)
  //   if (savedCredential) {
  //     setCredential(JSON.parse(savedCredential))
  //   }
  // }, [])

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
    // const credential = await createWebAuthnCredential({
    //   name: "Smart Wallet"
    // })
    const credential = await createWebAuthnCredential(
      // Start the registration process
      await passkeyServerClient.startRegistration({
        context: {
          // userName that will be shown to the user when creating the passkey
          userName: "plusminushalf"
        }
      })
    )
    // Verify the registration
    const verifiedCredential = await passkeyServerClient.verifyRegistration(
      {
        credential,
        context: {
          // userName that will be shown to the user when creating the passkey
          userName: "plusminushalf"
        }
      }
    )
    setCredential(verifiedCredential)
    console.log("Credential created", credential)
    localStorage.setItem(SMART_WALLET_CREDENTIAL, JSON.stringify(credential))
    setCredential(credential)
  }

  const sendUserOperation = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (!smartAccountClient) return
    const quotes = await pimlicoClient.getTokenQuotes({
      tokens: [BASE_SEPOLIA_USDC_CONTRACT_ADDRESS]
    })
    console.log("Quotes", quotes)
    const paymaster = quotes[0].paymaster

    console.log("Paymaster", paymaster)

    const burnUsdcTransactionHash = await smartAccountClient.sendTransaction({
      calls: [
        // approve usdc to paymaster
        {
          to: getAddress(BASE_SEPOLIA_USDC_CONTRACT_ADDRESS),
          abi: parseAbi(["function approve(address,uint)"]),
          functionName: "approve",
          args: [paymaster, maxUint256],
        },
        // approve usdc to cctp token messenger
        {
          to: getAddress(BASE_SEPOLIA_USDC_CONTRACT_ADDRESS),
          abi: parseAbi(["function approve(address,uint)"]),
          functionName: "approve",
          args: [BASE_SEPOLIA_CCTP_TOKEN_MESSENGER, maxUint256],
        },
        // burn usdc
        {
          to: getAddress(BASE_SEPOLIA_CCTP_TOKEN_MESSENGER),
          abi: ITokenMessenger,
          functionName: 'depositForBurnWithHook',
          args: [
            parseUnits('1.1', 6), // 
            0, // dst domain
            toBytes32(ETH_SEPOLIA_TRANSFER_HOOK), // dst mintRecipient
            BASE_SEPOLIA_USDC_CONTRACT_ADDRESS, // src burn token
            ANY_CALLER, // dst authorized caller
            MAX_CCTP_TRASFER_FEE,
            MIN_CCTP_FINALITY_THRESHOLD,
            `${EHT_SEPOLIA_USDC_CONTRACT_ADDRESS}${encodeFunctionData({
              abi: IERC20,
              functionName: 'transfer',
              args: [
                "0x9a3f63F053512597d486cA679Ce5A0D13b98C8db",
                parseUnits('1', 6)
              ]
            }).slice(2)}`,

          ]
        }

      ],
      paymasterContext: {
        token: BASE_SEPOLIA_USDC_CONTRACT_ADDRESS,
      }
    })
    setTxHash(burnUsdcTransactionHash)

    const attestation = await retrieveAttestation(BASE_SEPOLIA_DOMAIN_ID.toString(), burnUsdcTransactionHash);
    console.log("Attestation", attestation);

    const sepoliaHookContract = getEthSepoliaHookContract();

    const redeemTx = await sepoliaHookContract.write.relayAndExecute([
      attestation.message, attestation.attestation
    ]);
    console.log("Redeem Tx", redeemTx);
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
      <>
        <br />
        <br />
        <button type="button" onClick={createCredential}>
          Create credential
          <br />
          <br />
          {smartAccountClient?.account.address}
        </button>
        <br />
        <button type="button" onClick={loginWithExistingCredential}>
          Login with existing credential
        </button>
      </>
    )

  return (
    <div>
        <br />
      <p>Credential: {credential.id}</p>
      <>
        <br />
        <h2>Account</h2>
        <br />
        <p>Address: {smartAccountClient?.account?.address}</p>
        <br />

        <h2>Send User Operation</h2>
        <form onSubmit={sendUserOperation}>
          <input name="to" placeholder="Address" />
          <input name="value" placeholder="Amount (ETH)" />
          <button type="submit">Send</button>
          {txHash && <p>Transaction Hash: {txHash}</p>}
        </form>
        {/* 
        <button type="button" onClick={handleLogout}>
          Logout
        </button> */}
      </>
    </div>
  )
}