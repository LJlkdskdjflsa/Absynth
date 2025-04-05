import { getContract } from "viem";
import { ITransferAdapter } from "../abis/abi";
import { ETH_SEPOLIA_TRANSFER_HOOK } from "../constants";
import { getEthSepoliaRedeemClient } from "../clients/eth-sepolia-client";

export const getEthSepoliaHookContract = () => getContract({
    address: ETH_SEPOLIA_TRANSFER_HOOK,
    abi: ITransferAdapter,
    client: getEthSepoliaRedeemClient()
});