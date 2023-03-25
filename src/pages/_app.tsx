import { BottomBar } from '@/components/BottomBar'
import { Navbar } from '@/components/Navbar'
import '@/styles/globals.css'
import { Token } from '@/types'
import type { AppProps } from 'next/app'
import { useState } from 'react'

export default function App({ Component, pageProps }: AppProps) {
  const [activeToken, setActiveToken] = useState<Token>({
    // network: 'avalanche',
    // address: '0x51e48670098173025c477d9aa3f0eff7bf9f7812',
    // coingeckoId: 'degenx',
    // name: 'DegenX',
    // symbol: 'DGNX'

    network: 'avalanche',
    address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    coingeckoId: 'avalanche-2',
    name: 'Avalanche',
    symbol: 'AVAX'
  })

  console.log('active', activeToken)
  
  return (
    <main className="min-h-screen grid grid-rows-[min-content_1fr_min-content]">
      <Navbar setActiveToken={setActiveToken} />
      <Component {...pageProps} activeToken={activeToken  } />
      <BottomBar />
    </main>
  )
}
