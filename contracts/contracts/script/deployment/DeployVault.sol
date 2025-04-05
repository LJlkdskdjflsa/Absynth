// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import {IERC20} from "@openzeppelin/contracts-5.2.0/token/ERC20/IERC20.sol";
import {Config} from "../Config.sol";
import {MockERC4626} from "../../MockERC4626.sol";

contract DeployVault is Script {
    uint256 privateKey;
    MockERC4626 internal instance;

    function setUp() external {
        privateKey = vm.envUint("PRIVATE_KEY");
        console.log("deployer: ", vm.addr(privateKey));
    }

    function run() external {
        (, address USDC, ,) = Config.config(block.chainid);
        vm.startBroadcast(privateKey);
        instance = new MockERC4626("Mock Token", "MT", IERC20(USDC));
        vm.stopBroadcast();
    }
}
