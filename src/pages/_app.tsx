import { BottomBar } from '@/components/BottomBar'
import { Navbar } from '@/components/Navbar'
import '@/styles/globals.css'
import { rubicNetworkToBitqueryNetwork, SearchResult, Token } from '@/types'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'

const fetchDGNXToken = async () => {
  const result = await fetch(`https://tokens.rubic.exchange/api/v1/tokens?symbol=dgnx&networks=avalanche&pageSize=1`)
  const data = await result.json()
  return data.results[0];
}

export default function App({ Component, pageProps }: AppProps) {
  const [activeToken, setActiveToken] = useState<Token>({
    network: 'avalanche',
    address: '0x51e48670098173025c477d9aa3f0eff7bf9f7812',
    coingeckoId: 'degenx',
    name: 'DegenX',
    symbol: 'DGNX',
    image: 'https://assets.rubic.exchange/assets/avalanche/0x51e48670098173025c477d9aa3f0eff7bf9f7812/logo.png',

    // network: 'avalanche',
    // address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    // coingeckoId: 'avalanche-2',
    // name: 'Avalanche',
    // symbol: 'AVAX'
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
  
  return (
    <main className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
      <Navbar setActiveToken={setActiveToken} />
      <Component {...pageProps} activeToken={activeToken  } />
      <BottomBar />
    </main>
  )
}
