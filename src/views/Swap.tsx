import merge from 'deepmerge'
import { TokenInput } from "@/components/TokenInput"
import { SwapButton } from "@/components/SwapButton"
import { SwapTokens } from "@/components/SwapTokens"
import { Token, chainsInfo } from "@/types"
import { useState } from "react"
import { calculateSwap } from '@/helpers/swap'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import { CrossChainTrade, OnChainTrade } from 'rubic-sdk'
import { FaWallet } from 'react-icons/fa'
import { BalanceAmount } from '@/components/BalanceAmount'
import { useAccount } from 'wagmi'
import { fetchBalance } from '@wagmi/core'

export const SwapView = () => {
    const [inputToken, setInputToken] = useState<Token | undefined>();
    const [outputToken, setOutputToken] = useState<Token | undefined>();
    const [inputAmount, setInputAmount] = useState<number>();

    const [inputBalance, setInputBalance] = useState<number>();
    const [externallySetAmount, setExternallySetAmount] = useState<number>(0);

    const [trade, setTrade] = useState<Awaited<ReturnType<typeof calculateSwap>>>();
    const [tradeLoading, setTradeLoading] = useState(false);

    const { address } = useAccount();

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
        console.log(res)
    }, [inputToken, outputToken, inputAmount]);

    const setInputFromBalance = async (factor: number, chainId: number, token: string) => {
        if (!address || !inputBalance) {
            return;
        }

        setInputAmount(inputBalance * factor);
        setExternallySetAmount(inputBalance * factor);
    }

    return (
        <div className="bg-slate-700 p-5 m-5 rounded-xl w-full">
            <div className="flex items-end gap-1">
                <div className="flex-grow">You&apos;re paying</div>
                {address && inputToken && <div className="flex items-center gap-1 text-xs">
                    <FaWallet /> {inputToken && (
                        <>
                            <BalanceAmount setInputBalance={setInputBalance} precision={4} tokenAddress={inputToken.token.address} chainId={chainsInfo[inputToken.chain].id} />
                            {inputToken.token.symbol}
                        </>
                    )}
                </div>}
                {inputToken && address && <div onClick={() => setInputFromBalance(0.5, chainsInfo[inputToken.chain].id, inputToken.token.address)} className="text-xs px-2 bg-slate-800 rounded-full border border-slate-900 cursor-pointer hover:border-orange-600 transition-colors">HALF</div>}
                {inputToken && address && <div onClick={() => setInputFromBalance(1, chainsInfo[inputToken.chain].id, inputToken.token.address)} className="text-xs px-2 bg-slate-800 rounded-full border border-slate-900 cursor-pointer hover:border-orange-600 transition-colors">MAX</div>}
            </div>
            <TokenInput token={inputToken} setToken={setInputToken} setInputAmount={setInputAmount} amount={inputAmount} externalAmount={externallySetAmount} />

            <SwapTokens swapTokens={swapTokens} />

            
            <div className="flex items-end">
                <div className="flex-grow">To receive</div>
                {address && outputToken && <div className="flex items-center gap-1 text-xs">
                    <FaWallet /> {outputToken && (
                        <>
                            <BalanceAmount precision={4} tokenAddress={outputToken.token.address} chainId={chainsInfo[outputToken.chain].id} />
                            {outputToken.token.symbol}
                        </>
                    )}
                </div>}
            </div>
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