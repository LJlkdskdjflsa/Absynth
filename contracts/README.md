# Absynth contracts

Based on Circle CCTP v2, establish a cross-chain execution hook.

## executable script

- `contracts/misc/cctpTransfer.mjs`: cross-chain payment
  - [successful relay tx](https://sepolia.basescan.org/tx/0x609669f18163b78ae529aec067236813315df590261b74caad6817bc71fc4913)
- `contracts/misc/cctpERC4626Deposit.mjs`: cross-chain erc4626 deposit
  - [successful relay tx](https://sepolia.basescan.org/tx/0xf3b0fa1cfbea31aa89c908fed87112251eb17bef1c2883c1dae37667fe74ee62)

## contracts

### MockERC4626

A ERC4626 with 1:1 exchange rate for demo.

- sepolia: [`0x138687daf4ff3f41b23d5e30728cd654a06dc9b5`](https://sepolia.etherscan.io/address/0x138687daf4ff3f41b23d5e30728cd654a06dc9b5)
- base-sepolia: [`0x5fFB7c6ce6D71470341E936beec4338A3a242Cf2`](https://sepolia.basescan.org/address/0x5ffb7c6ce6d71470341e936beec4338a3a242cf2)

### TransferAdapter

A cross-chain execution hook for payment.

- sepolia: [`0x8E56E6208F6b5C9F0a81Be2528CE786932947b89`](https://sepolia.etherscan.io/address/0x8e56e6208f6b5c9f0a81be2528ce786932947b89)
- base-sepolia: [`0x687B6e502dCF37DDBc5448357d99e9968a228fcB`](https://sepolia.basescan.org/address/0x687b6e502dcf37ddbc5448357d99e9968a228fcb)

### CCTPERC4626Adapter

A cross-chain execution hook for ERC4626 deposit/withdraw.

- base-sepolia: [`0xd8ba14f6e5c1392dc86b7d68cd48d12e8d252781`](https://sepolia.basescan.org/address/0xd8ba14f6e5c1392dc86b7d68cd48d12e8d252781)
