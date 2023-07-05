import merge from 'deepmerge'
import { TokenInput } from "@/components/TokenInput"
import { SwapButton } from "@/components/SwapButton"
import { SwapTokens } from "@/components/SwapTokens"
import { Chain, NULL_ADDRESS, RubicToken, Token, chainsInfo } from "@/types"
import { useState } from "react"
import { calculateSwap } from '@/helpers/swap'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import { CHAIN_TYPE, CrossChainTrade, OnChainTrade } from 'rubic-sdk'
import { FaWallet } from 'react-icons/fa'
import { LuSettings2 } from 'react-icons/lu'
import { BalanceAmount } from '@/components/BalanceAmount'
import { useAccount } from 'wagmi'
import { SlippageSelector } from '@/components/SlippageSelector'
import { getSDK, searchToken } from '@/helpers/rubic'
import { SwapHistory } from '@/components/SwapHistory'

export const SwapView = (props: { showRecentTrades?: boolean, setShowRecentTrades?: (show: boolean) => void }) => {
    const [inputToken, setInputToken] = useState<Token | undefined>();
    const [inputChain, setInputChain] = useState<Chain>()
    const [outputToken, setOutputToken] = useState<Token | undefined>();
    const [outputChain, setOutputChain] = useState<Chain>()
    const [inputAmount, setInputAmount] = useState<number>();
    const [slippage, setSlippage] = useState(4);

    const [sdkUpdated, setSDKupdated] = useState(0);

    const [showSlippageSelector, setShowSlippageSelector] = useState(false);

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

    useAsyncEffect(async () => {
        const qs = new URLSearchParams(window.location.search);
        if (qs.get('inputChain')) {
            const inputChain = Chain[qs.get('inputChain')?.toUpperCase() as keyof typeof Chain];
            setInputChain(inputChain)
            if (inputChain && qs.get('inputToken')) {
                const [token]: RubicToken[] = await searchToken(inputChain, qs.get('inputToken') || undefined);
                console.log(token)
                if (token) {
                    setInputToken({ token, chain: inputChain })
                }
            }
        }

        if (qs.get('outputChain')) {
            const outputChain = Chain[qs.get('outputChain')?.toUpperCase() as keyof typeof Chain];
            setOutputChain(outputChain)
            if (outputChain && qs.get('outputToken')) {
                const [token]: RubicToken[] = await searchToken(outputChain, qs.get('outputToken') || undefined);
                console.log(token)
                if (token) {
                    setOutputToken({ token, chain: outputChain })
                }
            }
        }

        if (qs.get('amount') && parseFloat(qs.get('amount') || '')) {
            setInputAmount(parseFloat(qs.get('amount')!))
            setExternallySetAmount(parseFloat(qs.get('amount')!))
        }
        if (qs.get('slippage') && parseFloat(qs.get('slippage') || '')) {
            setSlippage(parseFloat(qs.get('slippage')!))
        }
    }, [])

    useAsyncEffect(async () => {
        if (!address || !inputChain) return;
        console.log("updating config");
        (await getSDK()).updateWalletProviderCore(CHAIN_TYPE.EVM, {
            core: window.ethereum!,
            address
        });
        setSDKupdated(Math.random());
    }, [address, inputChain]);

    useAsyncEffect(async() => {
        if (!inputToken || !outputToken || !inputAmount) {
            return;
        }

        setTradeLoading(true);
        setTrade(undefined)
        const res = await calculateSwap(inputToken, outputToken, inputAmount, slippage);
        setTradeLoading(false);
        setTrade(res);
        console.log(res)
    }, [inputToken, outputToken, inputAmount, slippage, sdkUpdated]);

    const setInputFromBalance = async (factor: number, chainId: number, tokenAddress: string) => {
        if (!address || !inputBalance) {
            return;
        }

        let amount = inputBalance * factor;
        if (tokenAddress === NULL_ADDRESS && factor === 1) {
            amount = Math.max(0, amount - 0.05);
        }

        setInputAmount(amount);
        setExternallySetAmount(amount);
    }

    return (
        <>
            <div className="flex flex-col m-5 items-end gap-3">
                <div onClick={() => setShowSlippageSelector(true)} className="bg-slate-700 px-2 py-0.5 rounded-full cursor-pointer border border-slate-700 hover:border-slate-500 transition-colors hover:bg-slate-500 flex gap-1 items-center text-sm">
                    <LuSettings2 />{slippage}%
                </div>
                <div className="bg-slate-700 p-5 rounded-xl w-full">
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
                    <TokenInput selectedChain={inputChain} setSelectedChain={setInputChain} token={inputToken} setToken={setInputToken} setInputAmount={setInputAmount} amount={inputAmount} externalAmount={externallySetAmount} />

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
                        selectedChain={outputChain}
                        setSelectedChain={setOutputChain}
                        token={outputToken}
                        setToken={setOutputToken}
                        isOtherToken
                        tradeLoading={tradeLoading}
                        amount={(trade as (OnChainTrade | CrossChainTrade))?.to?.tokenAmount?.toNumber()}
                    />

                    <SwapButton tradeLoading={tradeLoading} trade={trade} setShowSwapHistory={props.setShowRecentTrades} inputToken={inputToken} outputToken={outputToken} />
                </div>
            </div>

            <SlippageSelector
                show={showSlippageSelector}
                setShow={setShowSlippageSelector}
                slippage={slippage}
                setSlippage={setSlippage}
            />

            <SwapHistory
                show={props.showRecentTrades}
                setShow={props.setShowRecentTrades}
            />
        </>
    )
}