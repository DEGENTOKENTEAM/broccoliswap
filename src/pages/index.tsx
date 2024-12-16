import Head from 'next/head'
import { useEffect, useState } from 'react'

import { DeBridgeComponent } from '@/components/DeBridge'
import NonSSR from '@/components/NonSSR'
import { Token } from '@/types'
import 'allotment/dist/style.css'
import { SwapView } from '@/views/Swap'

export default function Home(props: {
    activeToken: Token
    showRecentTrades?: boolean
    setShowRecentTrades?: (show: boolean) => void
    proMode: boolean
    setProMode: (x: boolean) => void
    reprToken: Token
    setReprToken: (x: Token) => void
}) {
    const [ready, setReady] = useState(false)

    useEffect(() => setReady(true), [])

    if (!ready) {
        return null
    }

    return (
        <>
            <Head>
                <title>Broccoliswap by DegenX | DGNX</title>
                <meta
                    name="description"
                    content="Broccoliswap by DGNX is the easiest to use cross chain swap aggregator"
                />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <link rel="icon" href="/logo.png" />
            </Head>
            <NonSSR>
                <div className="w-full mx-auto my-5 flex justify-center items-center flex-grow">
                    <DeBridgeComponent />
                    {/* <SwapView
                        showRecentTrades={props.showRecentTrades}
                        setShowRecentTrades={props.setShowRecentTrades}
                        proMode={props.proMode}
                        setProMode={props.setProMode}
                        reprToken={props.reprToken}
                        setReprToken={props.setReprToken}
                    /> */}
                </div>
            </NonSSR>
        </>
    )
}
