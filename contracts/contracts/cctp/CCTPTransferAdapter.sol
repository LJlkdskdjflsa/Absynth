// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

// deps
import {BaseAdapter} from "./BaseAdapter.sol";
// deps: circle
import {IReceiverV2} from "@circle/cctp/interfaces/v2/IReceiverV2.sol";
import {MessageV2} from "@circle/cctp/messages/v2/MessageV2.sol";
import {BurnMessageV2} from "@circle/cctp/messages/v2/BurnMessageV2.sol";
// deps: memview-sol
import {TypedMemView} from "@memview-sol/contracts/TypedMemView.sol";

contract CCTPTransferAdapter is BaseAdapter {
    using TypedMemView for bytes;
    using TypedMemView for bytes29;

    uint256 internal constant ADDRESS_BYTE_LENGTH = 20;

    constructor(address _usdc, address _tokenMessenger, address _messageTransmitter)
        BaseAdapter(_usdc, _tokenMessenger, _messageTransmitter)
    {}

    /// @notice Relays a burn message to a local message transmitter without hook execution
    function relay(bytes calldata message, bytes calldata attestation) external {
        // validate message
        bytes29 _msg = message.ref(0);
        _validateMessage(_msg);
        // validate burn message
        bytes29 _msgBody = MessageV2._getMessageBody(_msg);
        _validateBurnMessage(_msgBody);
        // relay message
        _relay(message, attestation);
    }

    /// @notice Relays a burn message to a local message transmitter with hook execution
    function relayAndExecute(bytes calldata message, bytes calldata attestation)
        external
        returns (bytes memory hookReturnData)
    {
        // validate message
        bytes29 _msg = message.ref(0);
        _validateMessage(_msg);
        // validate burn message
        bytes29 _msgBody = MessageV2._getMessageBody(_msg);
        _validateBurnMessage(_msgBody);
        // relay message
        _relay(message, attestation);
        // execute hook
        bytes29 _hookData = BurnMessageV2._getHookData(_msgBody);
        hookReturnData = _hook(_hookData);
    }

    /// @dev handles hook data by executing a call to a target address
    /// @dev layout: | address | bytes |
    function _hook(bytes29 _hookData) internal returns (bytes memory ret) {
        require(_hookData.isValid(), "hook data invalid");

        uint256 _hookDataLength = _hookData.len();
        require(_hookDataLength >= ADDRESS_BYTE_LENGTH, "hook data invalid");

        // extract address
        address _target = _hookData.indexAddress(0);
        // extract calldata
        bytes memory _calldata = _hookData.postfix(_hookDataLength - ADDRESS_BYTE_LENGTH, 0).clone();
        // call
        bool success;
        (success, ret) = _target.call(_calldata);
        require(success, "Hook execution failed");
    }
}
