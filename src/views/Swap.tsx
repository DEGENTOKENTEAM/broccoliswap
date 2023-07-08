import merge from 'deepmerge'
import { TokenInput } from "@/components/TokenInput"
import { SwapButton } from "@/components/SwapButton"
import { SwapTokens } from "@/components/SwapTokens"
import { Chain, NULL_ADDRESS, RubicToken, Token, chainsInfo } from "@/types"
import { useMemo, useState } from "react"
import { calculateSwap } from '@/helpers/swap'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import { CHAIN_TYPE, CROSS_CHAIN_TRADE_TYPE, CrossChainTrade, OnChainTrade } from 'rubic-sdk'
import { FaWallet } from 'react-icons/fa'
import { LuSettings2 } from 'react-icons/lu'
import { PiWarningBold } from 'react-icons/pi'
import { BalanceAmount } from '@/components/BalanceAmount'
import { useAccount } from 'wagmi'
import { SlippageSelector } from '@/components/SlippageSelector'
import { getSDK, searchToken } from '@/helpers/rubic'
import { SwapHistory } from '@/components/SwapHistory'
import { IoMdRefresh } from 'react-icons/io'
import { classNames } from '@/helpers/classNames'
import { useProgress } from '@/hooks/useProgress'
import { RefreshButton } from '@/components/RefreshButton'
import { GoPlusTokenReponse, getTokenSecurity } from '@/helpers/goPlus'
import { GoLinkExternal } from 'react-icons/go'
import Link from 'next/link'
import { ImCross } from 'react-icons/im'

export const SwapView = (props: { showRecentTrades?: boolean, setShowRecentTrades?: (show: boolean) => void }) => {
    const [inputToken, setInputToken] = useState<Token | undefined>();
    const [inputChain, setInputChain] = useState<Chain>()
    const [outputToken, setOutputToken] = useState<Token | undefined>();
    const [outputChain, setOutputChain] = useState<Chain>()
    const [inputAmount, setInputAmount] = useState<number>();

    const [inputGPSec, setInputGPSec] = useState<GoPlusTokenReponse>();
    const [outputGPSec, setOutputGPSec] = useState<GoPlusTokenReponse>();

    const [slippage, setSlippage] = useState(4);

    const [swapSuccessTx, setSwapSuccessTx] = useState('');

    const [forceRefreshVar, forceRefresh] = useState(0);

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
        forceRefresh(Math.random());
    }, [address, inputChain]);

    useAsyncEffect(async() => {
        if (!inputToken || !outputToken || !inputAmount) {
            return;
        }

        setTradeLoading(true);
        setTrade(undefined)

        const [_trade, _inputGPSec, _outputGPSec] = await Promise.all([
            calculateSwap(inputToken, outputToken, inputAmount, slippage),
            getTokenSecurity(chainsInfo[inputToken.chain].id, inputToken.token.address),
            getTokenSecurity(chainsInfo[outputToken.chain].id, outputToken.token.address),
        ]);
        setTradeLoading(false);
        setTrade(_trade);
        setInputGPSec(_inputGPSec)
        setOutputGPSec(_outputGPSec)
    }, [inputToken, outputToken, inputAmount, slippage, forceRefreshVar]);

    const setInputFromBalance = async (factor: number, chainId: number, tokenAddress: string) => {
        if (!address || !inputBalance) {
            return;
        }

        let amount = Math.floor(100000 * inputBalance * factor) / 100000;
        if (tokenAddress === NULL_ADDRESS && factor === 1) {
            amount = Math.max(0, amount - 0.05);
        }

        setInputAmount(amount);
        setExternallySetAmount(amount);
    }

    const tokenTax = useMemo(() => {
        return (inputGPSec?.sell_tax || 0) + (outputGPSec?.buy_tax || 0);
    }, [inputGPSec, outputGPSec])

    return (
        <>
            <div className="flex flex-col mt-20 mx-5 mb-5 gap-3">
                <div className="flex">
                    <RefreshButton tradeLoading={tradeLoading} interval={60} refreshFn={() => forceRefresh(Math.random())} />
                    <div className="flex-grow"></div>
                    <div onClick={() => setShowSlippageSelector(true)} className="bg-slate-700 px-2 py-0.5 rounded-full cursor-pointer border border-slate-700 hover:border-slate-500 transition-colors hover:bg-slate-500 flex gap-1 items-center text-sm">
                        <LuSettings2 />{slippage}%
                        {(slippage < tokenTax || slippage - tokenTax > 10) && <PiWarningBold className="text-yellow-600" />}
                    </div>
                </div>
                <div className="bg-slate-700 p-5 rounded-xl w-full">
                    <div className="flex items-end gap-1">
                        <div className="flex-grow">You&apos;re paying</div>
                        {address && inputToken && <div className="flex items-center gap-1 text-xs">
                            <FaWallet /> {inputToken && (
                                <>
                                    <BalanceAmount refreshProp={forceRefreshVar} setInputBalance={setInputBalance} precision={4} tokenAddress={inputToken.token.address} chainId={chainsInfo[inputToken.chain].id} />
                                    {inputToken.token.symbol}
                                </>
                            )}
                        </div>}
                        {inputToken && address && inputBalance && inputBalance > 0.1 ? <div onClick={() => setInputFromBalance(0.5, chainsInfo[inputToken.chain].id, inputToken.token.address)} className="text-xs px-2 bg-slate-800 rounded-full border border-slate-900 cursor-pointer hover:border-orange-600 transition-colors hidden sm:block">HALF</div> : null}
                        {inputToken && address && inputBalance && inputBalance > 0.05 ? <div onClick={() => setInputFromBalance(1, chainsInfo[inputToken.chain].id, inputToken.token.address)} className="text-xs px-2 bg-slate-800 rounded-full border border-slate-900 cursor-pointer hover:border-orange-600 transition-colors">MAX</div> : null}
                    </div>
                    <TokenInput selectedChain={inputChain} setSelectedChain={setInputChain} token={inputToken} setToken={setInputToken} setInputAmount={setInputAmount} amount={inputAmount} externalAmount={externallySetAmount} />

                    <SwapTokens swapTokens={swapTokens} />
                    
                    <div className="flex items-end">
                        <div className="flex-grow">To receive</div>
                        {address && outputToken && <div className="flex items-center gap-1 text-xs">
                            <FaWallet /> {outputToken && (
                                <>
                                    <BalanceAmount refreshProp={forceRefreshVar} precision={4} tokenAddress={outputToken.token.address} chainId={chainsInfo[outputToken.chain].id} />
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

                    <SwapButton
                        tradeLoading={tradeLoading}
                        trade={trade}
                        onSwapDone={(tx: string) => {
                            setSwapSuccessTx(tx);
                            forceRefresh(Math.random());
                        }}
                        inputToken={inputToken}
                        outputToken={outputToken}
                    />

                    {slippage &&
                    slippage <
                        tokenTax && (
                        <div className="bg-yellow-400 border-2 border-yellow-500 p-3 rounded-xl text-black my-3">
                            The slippage you have selected is less than what you
                            will need for token taxes. This means the
                            transaction will most likely fail. Please make sure
                            the slippage includes all token taxes (which is{" "}
                            {tokenTax}%).
                        </div>
                    )}

                    {swapSuccessTx && outputChain && <div className="bg-green-400 border-2 border-green-500 p-3 rounded-xl text-black my-3">
                        <div className="flex mb-3 items-center justify-center">
                            <div className="flex-grow">Swap successful!</div>
                            <ImCross
                                className="cursor-pointer hover:text-orange-600 transition-colors"
                                onClick={() => setSwapSuccessTx('')}
                            />
                        </div>
                        <Link
                            target="_blank"
                            href={`${chainsInfo[outputChain].explorer}tx/${swapSuccessTx}`}
                            className="hover:underline bg-green-600 p-3 rounded-xl text-white mt-2 cursor-pointer hover:bg-green-800 font-bold transition-colors block text-center"
                        >View on explorer <GoLinkExternal className="inline" /></Link>
                        {inputToken?.chain !== outputToken?.chain && <div onClick={() => props.setShowRecentTrades?.(true)} className="bg-green-600 p-3 rounded-xl text-white mt-2 cursor-pointer hover:bg-green-800 transition-colors font-bold text-center">View Bridge Status</div>}
                    </div>}
                </div>
            </div>

            <SlippageSelector
                show={showSlippageSelector}
                setShow={setShowSlippageSelector}
                slippage={slippage}
                setSlippage={setSlippage}
                tokenTax={tokenTax}
            />

            <SwapHistory
                show={props.showRecentTrades}
                setShow={props.setShowRecentTrades}
            />
        </>
    )
}