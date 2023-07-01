import Head from 'next/head'
import { SwapView } from '@/views/Swap';
import { useEffect, useState } from 'react';
import { Token } from '@/__old__types';

import "allotment/dist/style.css";
import NonSSR from '@/components/NonSSR';


export default function Home(props: { activeToken: Token }) {
  const [ready, setReady] = useState(false)

  useEffect(() => setReady(true), [])

  if (!ready) {
    return null;
  }

  return (
    <>
      <Head>
        <title>Broccoliswap Simple</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <NonSSR>
        <div className="w-full max-w-2xl mx-auto my-10 flex justify-center items-center">
          <SwapView />
        </div>
      </NonSSR>
    </>
  )
}
