// SPDX-License-Identifier: MIT
pragma solidity >=0.5.0 <0.9.0;

library Config {
    // chain id
    uint256 constant Sepolia = 11155111;
    uint256 constant BaseSepolia = 84532;
    uint256 constant LineaSepolia = 59141;

    // domain
    uint32 constant Domain_Sepolia = 0;
    uint32 constant Domain_BaseSepolia = 6;
    uint32 constant Domain_LineaSepolia = 11;

    // USDC
    address constant USDC_Sepolia = 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238;
    address constant USDC_BaseSepolia = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant USDC_LineaSepolia = 0xFEce4462D57bD51A6A552365A011b95f0E16d9B7;

    // cctp-v2 TokenMessengerV2
    address constant TokenMessengerV2_Sepolia = 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA;
    address constant TokenMessengerV2_BaseSepolia = 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA;
    address constant TokenMessengerV2_LineaSepolia = 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA;

    // cctp-v2 MessageTransmitterV2
    address constant MessageTransmitterV2_Sepolia = 0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275;
    address constant MessageTransmitterV2_BaseSepolia = 0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275;
    address constant MessageTransmitterV2_LineaSepolia = 0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275;

    function config(uint256 chainId)
        internal
        pure
        returns (uint32 domain, address usdc, address tokenMsg, address transmitter)
    {
        if (chainId == Sepolia) {
            domain = Domain_Sepolia;
            usdc = USDC_Sepolia;
            tokenMsg = TokenMessengerV2_Sepolia;
            transmitter = MessageTransmitterV2_Sepolia;
        } else if (chainId == BaseSepolia) {
            domain = Domain_BaseSepolia;
            usdc = USDC_BaseSepolia;
            tokenMsg = TokenMessengerV2_BaseSepolia;
            transmitter = MessageTransmitterV2_BaseSepolia;
        } else if (chainId == LineaSepolia) {
            domain = Domain_LineaSepolia;
            usdc = USDC_LineaSepolia;
            tokenMsg = TokenMessengerV2_LineaSepolia;
            transmitter = MessageTransmitterV2_LineaSepolia;
        } else {
            revert("not supported");
        }
    }
}
