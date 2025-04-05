export const IERC20 = [
  {
    "type": "function",
    "name": "allowance",
    "inputs": [
      { "name": "owner", "type": "address", "internalType": "address" },
      { "name": "spender", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "approve",
    "inputs": [
      { "name": "spender", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "balanceOf",
    "inputs": [
      { "name": "account", "type": "address", "internalType": "address" }
    ],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "totalSupply",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "transfer",
    "inputs": [
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "transferFrom",
    "inputs": [
      { "name": "from", "type": "address", "internalType": "address" },
      { "name": "to", "type": "address", "internalType": "address" },
      { "name": "value", "type": "uint256", "internalType": "uint256" }
    ],
    "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "Approval",
    "inputs": [
      {
        "name": "owner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "spender",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "Transfer",
    "inputs": [
      {
        "name": "from",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "to",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "value",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  }
];

export const ITokenMessenger = [
  {
    "type": "function",
    "name": "depositForBurn",
    "inputs": [
      { "name": "amount", "type": "uint256", "internalType": "uint256" },
      {
        "name": "destinationDomain",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "mintRecipient",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      { "name": "burnToken", "type": "address", "internalType": "address" },
      {
        "name": "destinationCaller",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      { "name": "maxFee", "type": "uint256", "internalType": "uint256" },
      {
        "name": "minFinalityThreshold",
        "type": "uint32",
        "internalType": "uint32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "depositForBurnWithHook",
    "inputs": [
      { "name": "amount", "type": "uint256", "internalType": "uint256" },
      {
        "name": "destinationDomain",
        "type": "uint32",
        "internalType": "uint32"
      },
      {
        "name": "mintRecipient",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      { "name": "burnToken", "type": "address", "internalType": "address" },
      {
        "name": "destinationCaller",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      { "name": "maxFee", "type": "uint256", "internalType": "uint256" },
      {
        "name": "minFinalityThreshold",
        "type": "uint32",
        "internalType": "uint32"
      },
      { "name": "hookData", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  }
];

export const ITransferAdapter = [
  {
    "type": "constructor",
    "inputs": [
      { "name": "_usdc", "type": "address", "internalType": "address" },
      {
        "name": "_tokenMessenger",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "_messageTransmitter",
        "type": "address",
        "internalType": "address"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "messageTransmitter",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract IReceiverV2"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "relay",
    "inputs": [
      { "name": "message", "type": "bytes", "internalType": "bytes" },
      { "name": "attestation", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "relayAndExecute",
    "inputs": [
      { "name": "message", "type": "bytes", "internalType": "bytes" },
      { "name": "attestation", "type": "bytes", "internalType": "bytes" }
    ],
    "outputs": [
      { "name": "hookReturnData", "type": "bytes", "internalType": "bytes" }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "supportedMessageBodyVersion",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "supportedMessageVersion",
    "inputs": [],
    "outputs": [{ "name": "", "type": "uint32", "internalType": "uint32" }],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "tokenMessenger",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "address",
        "internalType": "contract ITokenMessengerV2"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "usdc",
    "inputs": [],
    "outputs": [
      { "name": "", "type": "address", "internalType": "contract IERC20" }
    ],
    "stateMutability": "view"
  }
];
