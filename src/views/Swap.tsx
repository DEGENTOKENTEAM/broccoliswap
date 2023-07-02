import merge from 'deepmerge'
import { TokenInput } from "@/components/TokenInput"
import { SwapButton } from "@/components/SwapButton"
import { SwapTokens } from "@/components/SwapTokens"
import { Token } from "@/types"
import { useState } from "react"
import { calculateSwap } from '@/helpers/swap'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk'

export const SwapView = () => {
    const [inputToken, setInputToken] = useState<Token | undefined>();
    const [outputToken, setOutputToken] = useState<Token | undefined>();
    const [inputAmount, setInputAmount] = useState<number>();

    const [trade, setTrade] = useState<Awaited<ReturnType<typeof calculateSwap>>>();
    const [tradeLoading, setTradeLoading] = useState(false);

    const swapTokens = () => {
        const _input = inputToken ? merge({}, inputToken) : undefined
        setInputToken(outputToken)
        setOutputToken(_input)
    }

    useAsyncEffect(async() => {
        if (!inputToken || !outputToken || !inputAmount) {
            return;
        }

        setTradeLoading(true);
        setTrade(undefined)
        const res = await calculateSwap(inputToken, outputToken, inputAmount);
        setTradeLoading(false);
        setTrade(res);
    }, [inputToken, outputToken, inputAmount]);

    return (
        <div className="bg-slate-700 p-5 m-5 rounded-xl w-full">
            You&apos;re paying
            <TokenInput token={inputToken} setToken={setInputToken} setInputAmount={setInputAmount} amount={inputAmount} />

            <SwapTokens swapTokens={swapTokens} />

            To receive
            <TokenInput
                token={outputToken}
                setToken={setOutputToken}
                isOtherToken
                tradeLoading={tradeLoading}
                amount={(trade as (OnChainTrade | CrossChainTrade))?.to?.tokenAmount?.toNumber()}
            />

            <SwapButton tradeLoading={tradeLoading} trade={trade} />
        </div>
    )
}