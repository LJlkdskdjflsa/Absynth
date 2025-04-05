"use client"
import { createWalletClient } from "viem";
import { sepolia } from "viem/chains";
import { http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

export const getEthSepoliaRedeemClient = () => createWalletClient({
    chain: sepolia,
    transport: http(),
    account: privateKeyToAccount(process.env.NEXT_PUBLIC_ETH_SEPOLIA_MESSAGE_SENDER_PRIVATE_KEY as `0x${string}`),
});