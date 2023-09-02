import { BottomBar } from '@/components/BottomBar'
import { Navbar } from '@/components/Navbar'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { avalanche, bsc, mainnet } from 'wagmi/chains'
import NonSSR from '@/components/NonSSR'
import { infuraProvider } from 'wagmi/providers/infura'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import * as errorReporting from '../helpers/errorReporting';

const { chains } = configureChains(
  [mainnet, avalanche, bsc],
  [infuraProvider({ apiKey: process.env.NEXT_PUBLIC_INFURA_ID! }), publicProvider()],
)

errorReporting.initialize();
const ErrorBoundary = errorReporting.getErrorBoundary();

const config = createConfig({
  ...getDefaultConfig({
      infuraId: process.env.NEXT_PUBLIC_INFURA_ID!,
      walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
      appName: "Broccoliswap by DegenX",
      chains
  }),
})

console.log(config)

export default function App({ Component, pageProps, router }: AppProps) {
  const [showRecentTrades, setShowRecentTrades] = useState(false);

  return (
    <NonSSR>
      {/* @ts-ignore */}
      <ErrorBoundary>
        <WagmiConfig config={config}>
          <ConnectKitProvider options={{initialChainId:0}}>
          <main className=" ">
            <Navbar onClickRecentTrades={() => setShowRecentTrades(true)} />
            <Component {...pageProps} showRecentTrades={showRecentTrades} setShowRecentTrades={setShowRecentTrades} />
            <BottomBar />
          </main>
          </ConnectKitProvider>
        </WagmiConfig>
      </ErrorBoundary>
    </NonSSR>
  )
}
