// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

// deps
import {BaseAdapter} from "./BaseAdapter.sol";
// deps
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// deps: circle
import {IReceiverV2} from "@circle/cctp/interfaces/v2/IReceiverV2.sol";
import {MessageV2} from "@circle/cctp/messages/v2/MessageV2.sol";
import {BurnMessageV2} from "@circle/cctp/messages/v2/BurnMessageV2.sol";
// deps: memview-sol
import {TypedMemView} from "@memview-sol/contracts/TypedMemView.sol";

contract CCTPERC4626Adapter is BaseAdapter {
    using TypedMemView for bytes;
    using TypedMemView for bytes29;

    uint256 internal constant ADDRESS_BYTE_LENGTH = 20;

    uint256 internal constant SELECTOR_BYTE_LENGTH = 4;

    // vault => user => shares
    mapping(address => mapping(address => uint256)) public accounting;

    constructor(address _usdc, address _tokenMessenger, address _messageTransmitter)
        BaseAdapter(_usdc, _tokenMessenger, _messageTransmitter)
    {
        // approve for token messenger
        IERC20(_usdc).approve(_tokenMessenger, type(uint256).max);
    }

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

        // cached messageSender, mintRecipient, source domain
        address srcMsgSender = address(uint160(uint256(BurnMessageV2._getMessageSender(_msgBody))));
        address dstMintRecipient = address(uint160(uint256(BurnMessageV2._getMintRecipient(_msgBody))));
        uint32 srcDomain = MessageV2._getSourceDomain(_msg);
        require(dstMintRecipient == address(this), "adaptor doesn't receive fund");

        // relay message
        _relay(message, attestation);

        // execute hook
        bytes29 _hookData = BurnMessageV2._getHookData(_msgBody);
        // extract address(index=0)
        address _target = _hookData.indexAddress(0);
        // extract selector(index=20), uint256(index=24), address(index=56)
        bytes4 _selector = bytes4(uint32(uint256(_hookData.index(20, 4)) >> ((32 - 4) * 8)));
        require(_selector == 0x6e553f65 || _selector == 0xb460af94, "operation not support");
        // uint256 _balance = _hookData.indexUint(24, 32);
        address _receiver = address(uint160(uint256(_hookData.indexUint(56, 32))));
        require(_receiver == address(this));

        {
            usdc.approve(_target, type(uint256).max);
            hookReturnData = _hook(_hookData);
        }

        // accounting
        if (_selector == 0x6e553f65) {
            // erc4626 deposit
            uint256 shares = abi.decode(hookReturnData, (uint256));
            accounting[_target][srcMsgSender] += shares;
        }
        if (_selector == 0xb460af94) {
            // erc4626 withdraw
            uint256 shares = abi.decode(hookReturnData, (uint256));
            accounting[_target][srcMsgSender] -= shares;

            // refund USDC from dst domain to src domain
            uint256 usdcBalance = usdc.balanceOf(address(this));
            _deposit(usdcBalance, srcDomain, srcMsgSender, address(0));
        }
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
