"use client"

import axios from 'axios'
import { baseSepolia } from 'viem/chains';
import { IERC20, ITokenMessenger, ITransferAdapter } from '../abis/abi'
import { createWalletClient, encodeFunctionData, getContract, http, parseUnits } from "viem";
import { privateKeyToAccount } from 'viem/accounts'
import { useEthereumSepoliaSmartAccountBundlerClient } from '../hooks/use-eth-sepolia-smart-account-bundler-client';


export async function crossChainDonate(smartAccount: any, amount: number, organizationAddress: string) {
    // ethereum sepolia client
    const { bundlerClient: ethereumSepoliaBundlerClient } = useEthereumSepoliaSmartAccountBundlerClient()

    // base chain messenger
    const baseMessageSenderAccount = privateKeyToAccount(process.env.NEXT_PUBLIC_BASE_MESSAGE_SENDER_PRIVATE_KEY as `0x${string}`);

    /** ***** ***** ***** ***** ***** ***** ***** *****
     * Circle config
     ***** ***** ***** ***** ***** ***** ***** ***** */
    // circle cctp domain
    const Domain_Sepolia = 0;

    // circle usdc address
    const sepolia_usdc = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    const baseSepolia_usdc = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

    // circle token messenger v2
    const sepolia_token_messenger = '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa';

    // circle token transmitter v2

    // utils
    const any_caller = '0x0000000000000000000000000000000000000000000000000000000000000000';
    const maxFee = BigInt(500);
    const minFinalityThreshold = 1000;

    // custom adapter
    const baseSepolia_transfer_hook = '0x687B6e502dCF37DDBc5448357d99e9968a228fcB'

    /** ***** ***** ***** ***** ***** ***** ***** *****
     * client & contract
     ***** ***** ***** ***** ***** ***** ***** ***** */

    // base sepolia client
    const baseSepoliaClient = createWalletClient({
        chain: baseSepolia,
        transport: http(),
        account: baseMessageSenderAccount,
    });

    // contract

    const baseSepolia_transfer_hook_contract = getContract({
        address: baseSepolia_transfer_hook,
        abi: ITransferAdapter,
        client: baseSepoliaClient,
    });

    /** ***** ***** ***** ***** ***** ***** ***** *****
     * helper function
     ***** ***** ***** ***** ***** ***** ***** ***** */

    function toBytes32(addr: string): string {
        return `0x000000000000000000000000${addr.slice(2)}`;
    }

    async function retrieveAttestation(domain: string, transactionHash: string) {
        console.log('Retrieving attestation...')
        // txhash of burning usdc with circle specified domain id
        const url = `https://iris-api-sandbox.circle.com/v2/messages/${domain}?transactionHash=${transactionHash}`;
        console.log(url);
        while (true) {
            try {
                const response = await axios.get(url)
                if (response.status === 404) {
                    console.log('Waiting for attestation...')
                }
                if (response.data?.messages?.[0]?.status === 'complete') {
                    console.log('Attestation retrieved successfully!')
                    return response.data.messages[0]
                }
                console.log('Waiting for attestation...')
                await new Promise((resolve) => setTimeout(resolve, 5000))
            } catch (error: unknown) {
                console.error('Error fetching attestation:', error instanceof Error ? error.message : String(error))
                await new Promise((resolve) => setTimeout(resolve, 5000))
            }
        }
    }

    /** ***** ***** ***** ***** ***** ***** ***** *****
     * entry point
     ***** ***** ***** ***** ***** ***** ***** ***** */

    (async () => {

        console.log("Donating to", organizationAddress, "amount", amount)

        console.log("Sending approve operation...")

        // Create transfer function data for USDC (with 6 decimals)
        const approveUsdcCall = encodeFunctionData({
            abi: IERC20,
            functionName: 'approve',
            args: [
                sepolia_token_messenger as `0x${string}`, // spender
                parseUnits(amount.toString(), 6) // value
            ]
        })

        console.log("Approve USDC Data", approveUsdcCall)

        console.log("Sending approve operation...")

        const approveTxHash = await ethereumSepoliaBundlerClient.sendUserOperation({
            account: smartAccount,
            calls: [
                {
                    to: sepolia_usdc,
                    data: approveUsdcCall
                }
            ],
            paymaster: true,
            maxPriorityFeePerGas: BigInt(4762500),
        })
        console.log("Approve tx hash:", approveTxHash)


        const brunUsdcCall = encodeFunctionData({
            abi: ITokenMessenger,
            functionName: 'depositForBurnWithHook',
            args: [
                parseUnits(amount.toString(), 6), // amount
                6, // dst domain
                toBytes32(baseSepolia_transfer_hook), // dst mintRecipient
                sepolia_usdc, // src burn token
                any_caller, // dst authorized caller
                maxFee,
                minFinalityThreshold,
                `${baseSepolia_usdc}${encodeFunctionData({
                    abi: IERC20,
                    functionName: 'transfer',
                    args: [
                        organizationAddress,
                        parseUnits(amount.toString(), 6)
                    ]
                }).slice(2)}`,

            ]
        })
        console.log("Burn USDC Data", brunUsdcCall)

        // Send the user operation
        console.log("Sending burn operation...")
        const burnTxHash = await ethereumSepoliaBundlerClient.sendUserOperation({
            account: smartAccount,
            calls: [
                {
                    to: sepolia_token_messenger,
                    data: brunUsdcCall
                }
            ],
            paymaster: true,
            maxPriorityFeePerGas: BigInt(4762500),
        })
        console.log("Burn tx hash:", burnTxHash)



        const attestation = await retrieveAttestation(Domain_Sepolia.toString(), burnTxHash);
        console.log("Attestation", attestation);

        const redeemTx = await baseSepolia_transfer_hook_contract.write.relayAndExecute([
            attestation.message, attestation.attestation
        ]);
        console.log("Redeem Tx", redeemTx);
    })()
}
