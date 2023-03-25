import Head from 'next/head'
import { Swap } from '@/components/Swap';
import { useEffect, useState } from 'react';
import { Token } from '@/types';

import "allotment/dist/style.css";
import NonSSR from '@/components/NonSSR';
import { TradeView } from '@/views/TradeView';
import { PortfolioView } from '@/views/PortfolioView';
import { useRouter } from 'next/router';


export default function Home(props: { activeToken: Token }) {
  const [ready, setReady] = useState(false)

  useEffect(() => setReady(true), [])

  if (!ready) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Broccoliswap</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <NonSSR>
        <TradeView activeToken={props.activeToken} />
      </NonSSR>
    </>
  )
}
