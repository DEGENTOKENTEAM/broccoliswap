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

const { chains, provider } = configureChains(
  [mainnet, avalanche, bsc],
  [publicProvider()],
)
const client = createClient({
  autoConnect: true,
  provider,
})

const fetchDGNXToken = async () => {
  const result = await fetch(`https://tokens.rubic.exchange/api/v1/tokens?symbol=dgnx&networks=avalanche&pageSize=1`)
  const data = await result.json()
  return data.results[0];
}

export default function App({ Component, pageProps, router }: AppProps) {

  return (
    <NonSSR>
      <WagmiConfig client={client}>
        <main className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
          <Navbar />
          <Component {...pageProps} />
          <BottomBar />
        </main>
      </WagmiConfig>
    </NonSSR>
  )
}
