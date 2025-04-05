import { SmartAccount } from 'viem/account-abstraction'

declare global {
  interface Window {
    account?: SmartAccount
  }
} 