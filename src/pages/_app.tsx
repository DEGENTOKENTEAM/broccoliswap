import { BottomBar } from '@/components/BottomBar'
import { Navbar } from '@/components/Navbar'
import '@/styles/globals.css'
import { SearchResult, Token } from '@/__old__types'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { WagmiConfig, createClient, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
import { avalanche, bsc, mainnet } from '@wagmi/chains'
import { getDefaultProvider } from 'ethers'
import NonSSR from '@/components/NonSSR'
import { ConnectKitProvider, getDefaultConfig } from 'connectkit'

const { chains, provider } = configureChains(
  [mainnet, avalanche, bsc],
  [publicProvider()],
)

const client = createClient({
    ...getDefaultConfig({
        chains,
        autoConnect: true,
        walletConnectProjectId:
            process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!,
        appName: 'DegenX Ecosystem DAPP',
    }),
    provider
  })


const fetchDGNXToken = async () => {
  const result = await fetch(`https://tokens.rubic.exchange/api/v1/tokens?symbol=dgnx&networks=avalanche&pageSize=1`)
  const data = await result.json()
  return data.results[0];
}

export default function App({ Component, pageProps, router }: AppProps) {
  const [showRecentTrades, setShowRecentTrades] = useState(false);

  return (
    <NonSSR>
      <WagmiConfig client={client}>
        <ConnectKitProvider options={{initialChainId:0}}>
        <main className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
          <Navbar onClickRecentTrades={() => setShowRecentTrades(true)} />
          <Component {...pageProps} showRecentTrades={showRecentTrades} setShowRecentTrades={setShowRecentTrades} />
          <BottomBar />
        </main>
        </ConnectKitProvider>
      </WagmiConfig>
    </NonSSR>
  )
}
