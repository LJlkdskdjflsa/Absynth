import "dotenv/config";
import { sepolia, baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from "viem/accounts";
import axios from 'axios';
import {IERC20, ITokenMessenger, ITransferAdapter, IERC4626} from "./abi.mjs";
import { createWalletClient, encodeFunctionData, getContract, http } from "viem";

/** ***** ***** ***** ***** ***** ***** ***** *****
 * private key
 ***** ***** ***** ***** ***** ***** ***** ***** */

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const account = privateKeyToAccount(PRIVATE_KEY);
console.log(account.address);

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
const baseSepolia_token_messenger = '0x8fe6b999dc680ccfdd5bf7eb0974218be2542daa';

// circle token transmitter v2
const sepolia_token_transmitter = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275';
const baseSepolia_token_transmitter = '0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275';

// utils
const any_caller = '0x0000000000000000000000000000000000000000000000000000000000000000';
const maxFee = 500n;
const minFinalityThreshold = 1000;

// erc4626 vault
const baseSepolia_erc4626 = '0x5fFB7c6ce6D71470341E936beec4338A3a242Cf2';

// custom adapter
const baseSepolia_erc4626_hook = '0xd8ba14f6e5c1392dc86b7d68cd48d12e8d252781';

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

const sepolia_token_messenger_contract = getContract({
  address: sepolia_token_messenger,
  abi: ITokenMessenger,
  client: sepoliaClient,
});

const baseSepolia_erc4626_hook_contract = getContract({
  address: baseSepolia_erc4626_hook,
  abi: ITransferAdapter, // the same abi
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
 * deposit ERC4626 from sepolia to base-sepolia
 ***** ***** ***** ***** ***** ***** ***** ***** */

(async () => {
  const approveTxHash = await sepolia_usdc_contract.write.approve([
    sepolia_token_messenger, 100_000000n
  ]);
  console.log(approveTxHash);

  const burnTxHash = await sepolia_token_messenger_contract.write.depositForBurnWithHook([
    1_200000n, // amount, 1.2 USDC
    6, // dst domain
    toBytes32(baseSepolia_erc4626_hook), // dst mintRecipient
    sepolia_usdc, // src burn token
    any_caller, // dst authorized caller
    maxFee,
    minFinalityThreshold,
    `${baseSepolia_erc4626}${encodeFunctionData({
      abi: IERC4626,
      functionName: 'deposit',
      args: [
        1_000000n,
        baseSepolia_erc4626_hook
      ]
    }).slice(2)}`,
  ]);
  // 0x2f683f8e4b54d3c5a5e476333943d3bf75e4364615dcde6c6f4a2ad6d3502ee6
  console.log(burnTxHash);

  const attestation = await retrieveAttestation(Domain_Sepolia, burnTxHash);
  console.log(attestation);

  const depositTx = await baseSepolia_erc4626_hook_contract.write.relayAndExecute([
    attestation.message, attestation.attestation
  ]);
  // 0xf3b0fa1cfbea31aa89c908fed87112251eb17bef1c2883c1dae37667fe74ee62
  console.log(depositTx);
})();
