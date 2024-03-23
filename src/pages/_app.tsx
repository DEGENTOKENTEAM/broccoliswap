import { BottomBar } from '@/components/BottomBar'
import { Navbar } from '@/components/Navbar'
import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { WagmiConfig, configureChains, createConfig } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { avalanche, bsc, mainnet, arbitrum, polygon, fantom, base } from 'wagmi/chains'
import NonSSR from '@/components/NonSSR'
import { infuraProvider } from 'wagmi/providers/infura'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'
import * as errorReporting from '../helpers/errorReporting';
import { setUTMParameters, trackStartVisit } from '@/helpers/track'
import { Token } from '@/types'
import { QueryClient, QueryClientProvider } from 'react-query'

const { chains } = configureChains(
  [mainnet, avalanche, bsc, arbitrum, polygon, fantom, base],
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

export default function App({ Component, pageProps, router }: AppProps) {
  const [showRecentTrades, setShowRecentTrades] = useState(false);
  const [proMode, setProMode] = useState(false);
  const [reprToken, setReprToken] = useState<Token | undefined>()

  useEffect(() => {
    setUTMParameters(new URLSearchParams(window.location.search))
    const visitStartTime = localStorage.getItem('visitStartTime');
    if (!visitStartTime || parseInt(visitStartTime) < Date.now() - (30 * 60 * 1000)) {
        localStorage.setItem('visitStartTime', Date.now().toString());
        trackStartVisit();
    }

    const qs = new URLSearchParams(window.location.search)
    if (qs.get('pro') || localStorage.getItem('proMode')) {
        localStorage.setItem('proMode', 'true')
        setProMode(true);
    }
  }, []);

  const queryClient = new QueryClient();

  return (
    <NonSSR>
      {/* @ts-ignore */}
      <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
          <WagmiConfig config={config}>
            <ConnectKitProvider options={{initialChainId:0}}>
            <main className=" ">
              <Navbar
                onClickRecentTrades={() => setShowRecentTrades(true)}
                proMode={proMode}
                setToken={setReprToken}
                setProMode={setProMode}
              />
              <Component
                {...pageProps}
                showRecentTrades={showRecentTrades}
                setShowRecentTrades={setShowRecentTrades}
                proMode={proMode}
                setProMode={setProMode}
                reprToken={reprToken}
                setReprToken={setReprToken}
              />
              <BottomBar />
            </main>
            </ConnectKitProvider>
          </WagmiConfig>
        </QueryClientProvider>
      </ErrorBoundary>
    </NonSSR>
  )
}
