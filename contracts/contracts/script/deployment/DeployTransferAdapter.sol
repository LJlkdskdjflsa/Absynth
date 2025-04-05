// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Config} from "../Config.sol";
import {CCTPTransferAdapter} from "../../cctp/CCTPTransferAdapter.sol";

contract DeployTransferAdapter is Script {
    uint256 privateKey;
    CCTPTransferAdapter internal instance;

    function setUp() external {
        privateKey = vm.envUint("PRIVATE_KEY");
        console.log("deployer: ", vm.addr(privateKey));
    }

    function run() external {
        uint256 chainId = vm.promptUint("chainId ");
        (, address USDC, address tokenMsg, address transmitter) = Config.config(chainId);
        vm.startBroadcast(privateKey);
        instance = new CCTPTransferAdapter(USDC, tokenMsg, transmitter);
        vm.stopBroadcast();
    }
}
