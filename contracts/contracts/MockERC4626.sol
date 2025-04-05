// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "@openzeppelin/contracts-5.2.0/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts-5.2.0/token/ERC20/ERC20.sol";
import {ERC4626} from "@openzeppelin/contracts-5.2.0/token/ERC20/extensions/ERC4626.sol";
import {Math} from "@openzeppelin/contracts-5.2.0/utils/math/Math.sol";

contract MockERC4626 is ERC4626 {
    constructor(string memory name, string memory symbol, IERC20 underlyingToken)
        ERC20(name, symbol)
        ERC4626(underlyingToken)
    {}

    function _convertToAssets(uint256 _shares, Math.Rounding)
        internal
        pure
        override
        returns (uint256 _assets)
    {
        _assets = _shares;
    }

    function _convertToShares(uint256 _assets, Math.Rounding)
        internal
        pure
        override
        returns (uint256 _shares)
    {
        _shares = _assets;
    }
}
