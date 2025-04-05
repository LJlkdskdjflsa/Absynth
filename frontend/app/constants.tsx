
export const USDC_CONTRACT_ADDRESS = '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d'
export const USDC_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  }
] as const


