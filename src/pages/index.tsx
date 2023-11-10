import Head from 'next/head'
import { SwapView } from '@/views/Swap';
import { useEffect, useState } from 'react';

import "allotment/dist/style.css";
import NonSSR from '@/components/NonSSR';
import { Token } from '@/types';

export default function Home(props: {
  activeToken: Token;
  showRecentTrades?: boolean;
  setShowRecentTrades?: (show: boolean) => void;
  proMode: boolean;
  reprToken: Token;
  setReprToken: (x: Token) => void;
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => setReady(true), [])

  if (!ready) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Broccoliswap by DegenX | DGNX</title>
        <meta name="description" content="Broccoliswap by DGNX is the easiest to use cross chain swap aggregator" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <NonSSR>
        <div className="w-full mx-auto my-10 flex justify-center items-center">
          <SwapView
            showRecentTrades={props.showRecentTrades}
            setShowRecentTrades={props.setShowRecentTrades}
            proMode={props.proMode}
            reprToken={props.reprToken}
            setReprToken={props.setReprToken}
          />
        </div>
      </NonSSR>
    </>
  )
}
