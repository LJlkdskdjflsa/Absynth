import "dotenv/config";
import { sepolia, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from "viem/accounts";
import axios from 'axios';
import {IERC20, ITokenMessenger, ITransferAdapter} from "./abi.mjs";
import { createWalletClient, encodeFunctionData, getContract, http } from "viem";

/** ***** ***** ***** ***** ***** ***** ***** *****
 * private key
 ***** ***** ***** ***** ***** ***** ***** ***** */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const account = privateKeyToAccount(PRIVATE_KEY);

/** ***** ***** ***** ***** ***** ***** ***** *****
 * Circle config
 ***** ***** ***** ***** ***** ***** ***** ***** */
// circle cctp domain
const Domain_Sepolia = 0;
const Domain_BaseSepolia = 6;
const Domain_LineaSepolia = 11;

// circle usdc address
const sepolia_usdc = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
const baseSepolia_usdc = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';

// circle token messenger v2
const sepolia_token_messenger = '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa';

// circle token transmitter v2
const sepolia_token_transmitter = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275';
const baseSepolia_token_transmitter = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275';

// utils
const any_caller = '0x0000000000000000000000000000000000000000000000000000000000000000';
const maxFee = 500n;
const minFinalityThreshold = 1000;

// custom adapter
const baseSepolia_transfer_hook = '0x687B6e502dCF37DDBc5448357d99e9968a228fcB'

/** ***** ***** ***** ***** ***** ***** ***** *****
 * client & contract
 ***** ***** ***** ***** ***** ***** ***** ***** */

// ethereum sepolia client
const sepoliaClient = createWalletClient({
  chain: sepolia,
  transport: http(),
  account,
});

// base sepolia client
const baseSepoliaClient = createWalletClient({
  chain: baseSepolia,
  transport: http(),
  account,
});

// contract
const sepolia_usdc_contract = getContract({
  address: sepolia_usdc,
  abi: IERC20,
  client: sepoliaClient,
});

const sepolia_tokenMessenger_contract = getContract({
  address: sepolia_token_messenger,
  abi: ITokenMessenger,
  client: sepoliaClient,
});

const baseSepolia_transfer_hook_contract = getContract({
  address: baseSepolia_transfer_hook,
  abi: ITransferAdapter,
  client: baseSepoliaClient,
});

/** ***** ***** ***** ***** ***** ***** ***** *****
 * helper function
 ***** ***** ***** ***** ***** ***** ***** ***** */

function toBytes32(addr) {
  return `0x000000000000000000000000${addr.slice(2)}`;
}

async function retrieveAttestation(domain, transactionHash) {
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
    } catch (error) {
      console.error('Error fetching attestation:', error.message)
      await new Promise((resolve) => setTimeout(resolve, 5000))
    }
  }
}

/** ***** ***** ***** ***** ***** ***** ***** *****
 * entry point
 ***** ***** ***** ***** ***** ***** ***** ***** */

(async () => {
  const approveTxHash = await sepolia_usdc_contract.write.approve([
    sepolia_token_messenger, 1_000000n
  ]);
  console.log(approveTx);

  const burnTxHash = await sepolia_tokenMessenger_contract.write.depositForBurnWithHook([
    1_000000n, // amount
    6, // dst domain
    toBytes32(baseSepolia_transfer_hook), // dst mintRecipient
    sepolia_usdc, // src burn token
    any_caller, // dst authorized caller
    maxFee,
    minFinalityThreshold,
    // dynamic bytes
    // - address || payload
    `${baseSepolia_usdc}${encodeFunctionData({
      abi: IERC20,
      functionName: 'transfer',
      args: [
        account.address,
        1_000000n
      ]
    }).slice(2)}`,
  ]);
  console.log(burnTx);

  const attestation = await retrieveAttestation(Domain_Sepolia, "0x7128b510921c4fbdbe30ffe6206681c65f0f623fb3b710c2470692c5a37bdcea");
  console.log(attestation);

  const redeemTx = await baseSepolia_transfer_hook_contract.write.relayAndExecute([
    attestation.message, attestation.attestation
  ]);
  console.log(redeemTx);
})();
