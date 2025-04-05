// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

// deps: oz
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// deps: circle
import {IReceiverV2} from "@circle/cctp/interfaces/v2/IReceiverV2.sol";
import {MessageV2} from "@circle/cctp/messages/v2/MessageV2.sol";
import {BurnMessageV2} from "@circle/cctp/messages/v2/BurnMessageV2.sol";
import {ITokenMessengerV2} from "../interfaces/ITokenMessengerV2.sol";
// deps: memview-sol
import {TypedMemView} from "@memview-sol/contracts/TypedMemView.sol";

abstract contract BaseAdapter {
    using TypedMemView for bytes;
    using TypedMemView for bytes29;

    IERC20 public immutable usdc;
    ITokenMessengerV2 public immutable tokenMessenger;

    IReceiverV2 public immutable messageTransmitter;

    uint32 public constant supportedMessageVersion = 1;

    uint32 public constant supportedMessageBodyVersion = 1;

    constructor(address _usdc, address _tokenMessenger, address _messageTransmitter) {
        require(_messageTransmitter != address(0), "Message transmitter is the zero address");
        usdc = IERC20(_usdc);
        messageTransmitter = IReceiverV2(_messageTransmitter);
        tokenMessenger = ITokenMessengerV2(_tokenMessenger);
    }

    /// @dev Validate message
    function _validateMessage(bytes29 message) internal pure {
        MessageV2._validateMessageFormat(message);
        require(MessageV2._getVersion(message) == supportedMessageVersion, "Invalid message version");
    }

    /// @dev Validate burn message
    function _validateBurnMessage(bytes29 message) internal pure {
        BurnMessageV2._validateBurnMessageFormat(message);
        require(BurnMessageV2._getVersion(message) == supportedMessageBodyVersion, "Invalid message body version");
    }

    /// @dev Relay message
    function _relay(bytes memory message, bytes memory attestation) internal {
        bool relaySuccess = messageTransmitter.receiveMessage(message, attestation);
        require(relaySuccess, "Receive message failed");
    }

    function _deposit(uint256 amount, uint32 dstDomain, address mintRecipient, address dstCaller) internal {
        tokenMessenger.depositForBurn(
            amount, dstDomain, toBytes32(mintRecipient), address(usdc), toBytes32(dstCaller), 500, 1000
        );
    }

    function _depositHook(uint256 amount, uint32 dstDomain, address mintRecipient, address dstCaller, bytes memory data)
        internal
    {
        tokenMessenger.depositForBurnWithHook(
            amount, dstDomain, toBytes32(mintRecipient), address(usdc), toBytes32(dstCaller), 500, 1000, data
        );
    }

    function toBytes32(address addr) private pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }
}
