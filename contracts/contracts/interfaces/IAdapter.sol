// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

interface IAdapter {
    /// @notice Relays a burn message to a local message transmitter without hook execution
    function relay(bytes calldata message, bytes calldata attestation) external;

    /// @notice Relays a burn message to a local message transmitter with hook execution
    function relayAndExecute(bytes calldata message, bytes calldata attestation) external returns (bytes memory);
}
