// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Config} from "../Config.sol";
import {CCTPERC4626Adapter} from "../../cctp/CCTPERC4626Adapter.sol";

contract DeployERC4626Adapter is Script {
    uint256 privateKey;
    CCTPERC4626Adapter internal instance;

    function setUp() external {
        privateKey = vm.envUint("PRIVATE_KEY");
        console.log("deployer: ", vm.addr(privateKey));
    }

    function run() external {
        uint256 chainId = vm.promptUint("chainId ");
        (, address USDC, address tokenMsg, address transmitter) = Config.config(chainId);
        vm.startBroadcast(privateKey);
        instance = new CCTPERC4626Adapter(USDC, tokenMsg, transmitter);
        vm.stopBroadcast();
    }
}
