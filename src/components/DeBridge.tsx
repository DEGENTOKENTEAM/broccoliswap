import { blockchainNameToChainID } from '@/helpers/chain'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import { useEffect, useRef, useState } from 'react'
import { zeroAddress } from 'viem'

declare global {
    interface Window {
        deBridge: any
    }
}

const URL = 'https://app.debridge.finance/assets/scripts/widget.js'

const loadScript = (src: string, callback: (error: any, ele?: any) => void) => {
    // only add once
    if (!document.getElementById('debridge-script')) {
        const script = document.createElement('script')
        script.src = src
        script.async = true
        script.id = 'debridge-script'
        script.onload = () => callback(null, script)
        script.onerror = () =>
            callback(new Error(`Failed to load script: ${src}`))
        document.body.appendChild(script)
    }
}

const initDebridgeWidget = (overrides?: any) => {
    if (window.deBridge && typeof window.deBridge.widget === 'function') {
        window.deBridge.widget({
            ...{
                v: '1',
                element: 'debridgeWidget',
                title: '',
                description: '',
                width: '400',
                height: '750',
                r: '30661',
                affiliateFeePercent: '1',
                affiliateFeeRecipient:
                    '0x000007eba76b61031826E9cF306EaC1b1B59eF5A',
                supportedChains:
                    '{"inputChains":{"1":"all","56":"all","137":"all","8453":"all","42161":"all","43114":"all","7565164":"all"},"outputChains":{"1":"all","56":"all","137":"all","8453":"all","42161":"all","43114":"all","7565164":"all"}}',
                inputChain: 43114,
                outputChain: 43114,
                inputCurrency: '',
                outputCurrency: '',
                address: '',
                showSwapTransfer: false,
                amount: '1',
                isAmountFromNotModifiable: false,
                lang: 'en',
                mode: 'deswap',
                isEnableCalldata: false,
                styles:
                    'eyJhcHBCYWNrZ3JvdW5kIjoiIzAyMzE0OCIsIm1vZGFsQmciOiIjMjI1MjcxIiwiY2hhcnRCZyI6IiMyMjUyNzEiLCJib3JkZXJDb2xvciI6IiMyMjUyNzEiLCJ0b29sdGlwQmciOiIjMjI1MjcxIiwidG9vbHRpcENvbG9yIjoiI2YyZjNmOSIsImZvcm1Db250cm9sQmciOiIjMDIwNjE4IiwiY29udHJvbEJvcmRlciI6IiMyMjUyNzEiLCJwcmltYXJ5IjoiIzBmOTc4ZSIsInN1Y2Nlc3MiOiIjMDBhYzhjIiwiZXJyb3IiOiIjZmYyNjRkIiwid2FybmluZyI6IiNmZmQ5MjYiLCJmb250Q29sb3IiOiIjZjJmM2Y5IiwiZm9udEZhbWlseSI6Ik1vbnRzZXJyYXQiLCJwcmltYXJ5QnRuQmciOiIjMDIwNjE4IiwicHJpbWFyeUJ0bkJnSG92ZXIiOiIjMjI1MjcxIiwicHJpbWFyeUJ0blRleHQiOiIjZjJmM2Y5Iiwic2Vjb25kYXJ5QnRuQmciOiIjMDIwNjE4Iiwic2Vjb25kYXJ5QnRuQmdIb3ZlciI6IiMyMjUyNzEiLCJzZWNvbmRhcnlCdG5UZXh0IjoiI2YyZjNmOSIsInNlY29uZGFyeUJ0bk91dGxpbmUiOiIjMjI1MjcxIiwiYnRuUGFkZGluZyI6eyJ0b3AiOjE2LCJyaWdodCI6bnVsbCwiYm90dG9tIjoxNiwibGVmdCI6bnVsbH0sImJ0bkZvbnRTaXplIjoxNiwiYnRuRm9udFdlaWdodCI6NTAwLCJmb3JtUGFkZGluZyI6eyJ0b3AiOjE2LCJyaWdodCI6bnVsbCwiYm90dG9tIjoxNiwibGVmdCI6bnVsbH0sImZvcm1IZWFkQnRuU2l6ZSI6IjQwIiwiZGVzY3JpcHRpb25Gb250U2l6ZSI6IjE0In0=',
                theme: 'dark',
                isHideLogo: true,
                logo: '',
                disabledWallets: [],
                disabledElements: ['Points', 'Latest trades'],
            },
            ...overrides,
        })
    }
}

export const DeBridgeComponent = () => {
    const [scriptLoaded, setScriptLoaded] = useState(false)
    const bridgeContainer = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadScript(URL, error => {
            if (error) {
                console.error(error)
                return
            }
            setScriptLoaded(true)
        })
    }, [])

    useAsyncEffect(async () => {
        if (!scriptLoaded) return

        const qs = new URLSearchParams(window.location.search)
        const swap = qs.get('swap')

        if (swap) {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/swapLink/${swap}`
            )

            const { link: result } = await response.json()

            initDebridgeWidget({
                inputChain: blockchainNameToChainID(result.inputChain),
                outputChain: blockchainNameToChainID(result.outputChain),
                inputCurrency:
                    result.inputToken == zeroAddress ? '' : result.inputToken,
                outputCurrency:
                    result.outputToken == zeroAddress ? '' : result.outputToken,
            })
        } else initDebridgeWidget()
    }, [scriptLoaded])

    return (
        <div
            id="debridgeWidget"
            ref={bridgeContainer}
            className="overflow-hidden rounded-lg border-2 border-activeblue bg-darkblue [&>iframe]:bg-darkblue"
        />
    )
}
