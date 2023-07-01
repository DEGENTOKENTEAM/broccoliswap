import { BottomBar } from '@/components/BottomBar'
import { Navbar } from '@/components/Navbar'
import '@/styles/globals.css'
import { SearchResult, Token } from '@/types'
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
  const [activeToken, setActiveToken] = useState<Token>({
    network: 'avalanche',
    address: '0x51e48670098173025c477d9aa3f0eff7bf9f7812',
    coingeckoId: 'degenx',
    name: 'DegenX',
    symbol: 'DGNX',
    image: 'https://assets.rubic.exchange/assets/avalanche/0x51e48670098173025c477d9aa3f0eff7bf9f7812/logo.png',
  })

  useEffect(() => {
    fetchDGNXToken().then((searchResult: SearchResult) => {
      setActiveToken({
        network: 'avalanche',
        address: '0x51e48670098173025c477d9aa3f0eff7bf9f7812',
        coingeckoId: 'degenx',
        name: 'DegenX',
        symbol: 'DGNX',
        image: 'https://assets.rubic.exchange/assets/avalanche/0x51e48670098173025c477d9aa3f0eff7bf9f7812/logo.png',
        price: searchResult.usdPrice,
      })
    })
  }, [])

  console.log('pa',pageProps)
  
  const mode = router.route.startsWith('/pro') ? 'pro' : 'simple';

  return (
    <NonSSR>
      <WagmiConfig client={client}>
        <main className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
          <Navbar setActiveToken={setActiveToken} mode={mode} />
          <Component {...pageProps} activeToken={activeToken  } />
          <BottomBar />
        </main>
      </WagmiConfig>
    </NonSSR>
  )
}
