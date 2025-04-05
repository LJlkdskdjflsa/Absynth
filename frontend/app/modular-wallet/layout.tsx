import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'
import { WalletProvider } from '../providers/modular-wallet-provider'
import Header from '../components/header'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Better World',
  description: 'Make a difference with transparent and secure donations',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <body className={inter.className}>
        <WalletProvider>
          <Header />
          {children}
          <Toaster />
        </WalletProvider>
      </body>
  )
}
