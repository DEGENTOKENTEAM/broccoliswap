import merge from 'deepmerge'
import { TokenInput } from '@/components/TokenInput'
import { SwapButton } from '@/components/SwapButton'
import { SwapTokens } from '@/components/SwapTokens'
import { Chain, NULL_ADDRESS, RubicToken, Token, chainsInfo } from '@/types'
import { useMemo, useState } from 'react'
import { calculateSwap } from '@/helpers/swap'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import { CHAIN_TYPE, CrossChainTrade, OnChainTrade } from 'rubic-sdk'
import { FaWallet } from 'react-icons/fa'
import { LuSettings2 } from 'react-icons/lu'
import { PiWarningBold } from 'react-icons/pi'
import { BalanceAmount } from '@/components/BalanceAmount'
import { useAccount } from 'wagmi'
import { SlippageSelector } from '@/components/SlippageSelector'
import { getSDK, searchToken } from '@/helpers/rubic'
import { SwapHistory } from '@/components/SwapHistory'
import { RefreshButton } from '@/components/RefreshButton'
import { GoPlusTokenReponse, getTokenSecurity } from '@/helpers/goPlus'
import { GoLinkExternal } from 'react-icons/go'
import Link from 'next/link'
import { ImCross } from 'react-icons/im'

export const SwapView = (props: {
    showRecentTrades?: boolean
    setShowRecentTrades?: (show: boolean) => void
}) => {
    const [inputToken, setInputToken] = useState<Token | undefined>()
    const [inputChain, setInputChain] = useState<Chain>()
    const [outputToken, setOutputToken] = useState<Token | undefined>()
    const [outputChain, setOutputChain] = useState<Chain>()
    const [inputAmount, setInputAmount] = useState<number>()

    const [inputGPSec, setInputGPSec] = useState<GoPlusTokenReponse>()
    const [outputGPSec, setOutputGPSec] = useState<GoPlusTokenReponse>()

    const [slippage, setSlippage] = useState(4)

    const [swapSuccessTx, setSwapSuccessTx] = useState<{
        tx: string
        inputChain: Chain
        outputChain: Chain
    }>()

    const [forceRefreshVar, forceRefresh] = useState(0)

    const [showSlippageSelector, setShowSlippageSelector] = useState(false)

    const [inputBalance, setInputBalance] = useState<number>()
    const [externallySetAmount, setExternallySetAmount] = useState<number>(0)

    const [trades, setTrades] = useState<
        Awaited<Awaited<ReturnType<typeof calculateSwap>>['trade']>
    >()
    const [tradeLoading, setTradeLoading] = useState(false)

    const { address } = useAccount()

    const swapTokens = () => {
        const _input = inputToken ? merge({}, inputToken) : undefined
        setInputToken(outputToken)
        setOutputToken(_input)
    }

    useAsyncEffect(async () => {
        const qs = new URLSearchParams(window.location.search)
        if (qs.get('inputChain')) {
            const inputChain =
                Chain[qs.get('inputChain')?.toUpperCase() as keyof typeof Chain]
            setInputChain(inputChain)
            if (inputChain && qs.get('inputToken')) {
                const [token]: RubicToken[] = await searchToken(
                    inputChain,
                    qs.get('inputToken') || undefined
                )
                if (token) {
                    setInputToken({ token, chain: inputChain })
                }
            }
        }

        if (qs.get('outputChain')) {
            const outputChain =
                Chain[
                    qs.get('outputChain')?.toUpperCase() as keyof typeof Chain
                ]
            setOutputChain(outputChain)
            if (outputChain && qs.get('outputToken')) {
                const [token]: RubicToken[] = await searchToken(
                    outputChain,
                    qs.get('outputToken') || undefined
                )
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
        if (!address || !inputChain) {
            return
        }
        ;(await getSDK()).updateWalletProviderCore(CHAIN_TYPE.EVM, {
            core: window.ethereum!,
            address,
        })
        forceRefresh(Math.random())
    }, [address, inputChain])

    useAsyncEffect(async () => {
        if (!inputToken || !outputToken || !inputAmount) {
            return
        }

        setTrades(undefined)

        const {
            trade: _trades,
            inputGPSec: _inputGPSec,
            outputGPSec: _outputGPSec,
        } = await calculateSwap(
            inputToken,
            outputToken,
            inputAmount,
            slippage,
            setTradeLoading
        )
console.log(_trades)
        setTrades(_trades)
        setInputGPSec(_inputGPSec)
        setOutputGPSec(_outputGPSec)
    }, [inputToken, outputToken, inputAmount, slippage, forceRefreshVar])

    const setInputFromBalance = async (
        factor: number,
        chainId: number,
        tokenAddress: string
    ) => {
        if (!address || !inputBalance) {
            return
        }

        let amount = Math.floor(100000 * inputBalance * factor) / 100000
        if (tokenAddress === NULL_ADDRESS && factor === 1) {
            amount = Math.max(0, amount - 0.05)
        }

        setInputAmount(amount)
        setExternallySetAmount(amount)
    }

    const tokenTax = useMemo(() => {
        return (inputGPSec?.sell_tax || 0) + (outputGPSec?.buy_tax || 0)
    }, [inputGPSec, outputGPSec])

    return (
        <>
            <div className="flex flex-col mt-20 mx-5 mb-5 gap-3">
                <div className="flex">
                    <RefreshButton
                        tradeLoading={tradeLoading}
                        interval={60}
                        refreshFn={() => forceRefresh(Math.random())}
                    />
                    <div className="flex-grow"></div>
                    <div
                        onClick={() => setShowSlippageSelector(true)}
                        className="bg-darkblue px-2 py-0.5 rounded-full cursor-pointer border-2 border-activeblue transition-colors hover:bg-activeblue flex gap-1 items-center text-sm"
                    >
                        <LuSettings2 />
                        {slippage}%
                        {(slippage < tokenTax || slippage - tokenTax > 10) && (
                            <PiWarningBold className="text-warning" />
                        )}
                    </div>
                </div>
                <div className="bg-darkblue border-activeblue border-2 p-5 rounded-xl w-full">
                    <div className="flex items-end gap-1">
                        <div className="flex-grow">You pay</div>
                        {address && inputToken && (
                            <div className="flex items-center gap-1 text-xs">
                                <FaWallet />{' '}
                                {inputToken && (
                                    <>
                                        <BalanceAmount
                                            refreshProp={forceRefreshVar}
                                            setInputBalance={setInputBalance}
                                            precision={4}
                                            tokenAddress={
                                                inputToken.token.address
                                            }
                                            chainId={
                                                chainsInfo[inputToken.chain].id
                                            }
                                        />
                                        {inputToken.token.symbol}
                                    </>
                                )}
                            </div>
                        )}
                        {inputToken &&
                        address &&
                        inputBalance &&
                        (inputBalance > 0.05 ||
                            inputToken.token.address !== NULL_ADDRESS) ? (
                            <div
                                onClick={() =>
                                    setInputFromBalance(
                                        0.5,
                                        chainsInfo[inputToken.chain].id,
                                        inputToken.token.address
                                    )
                                }
                                className="text-xs px-2 bg-darkblue rounded-full border border-activeblue cursor-pointer hover:bg-activeblue transition-colors hidden sm:block"
                            >
                                HALF
                            </div>
                        ) : null}
                        {inputToken &&
                        address &&
                        inputBalance &&
                        (inputBalance > 0.05 ||
                            inputToken.token.address !== NULL_ADDRESS) ? (
                            <div
                                onClick={() =>
                                    setInputFromBalance(
                                        1,
                                        chainsInfo[inputToken.chain].id,
                                        inputToken.token.address
                                    )
                                }
                                className="text-xs px-2 bg-darkblue rounded-full border border-activeblue cursor-pointer hover:bg-activeblue transition-colors hidden sm:block"
                            >
                                MAX
                            </div>
                        ) : null}
                    </div>
                    <TokenInput
                        selectedChain={inputChain}
                        setSelectedChain={setInputChain}
                        token={inputToken}
                        setToken={setInputToken}
                        setInputAmount={setInputAmount}
                        amount={inputAmount}
                        externalAmount={externallySetAmount}
                    />

                    <SwapTokens swapTokens={swapTokens} />

                    <div className="flex items-end">
                        <div className="flex-grow">To receive</div>
                        {address && outputToken && (
                            <div className="flex items-center gap-1 text-xs">
                                <FaWallet />{' '}
                                {outputToken && (
                                    <>
                                        <BalanceAmount
                                            refreshProp={forceRefreshVar}
                                            precision={4}
                                            tokenAddress={
                                                outputToken.token.address
                                            }
                                            chainId={
                                                chainsInfo[outputToken.chain].id
                                            }
                                        />
                                        {outputToken.token.symbol}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    <TokenInput
                        selectedChain={outputChain}
                        setSelectedChain={setOutputChain}
                        token={outputToken}
                        setToken={setOutputToken}
                        isOtherToken
                        tradeLoading={tradeLoading}
                        amount={(trades?.[0] as
                            | OnChainTrade
                            | CrossChainTrade)?.to?.tokenAmount?.toNumber()}
                    />

                    <SwapButton
                        tradeLoading={tradeLoading}
                        trades={trades}
                        onSwapDone={(
                            tx: string,
                            swapInputChain: Chain,
                            swapOutputChain: Chain
                        ) => {
                            setSwapSuccessTx({
                                tx,
                                inputChain: swapInputChain,
                                outputChain: swapOutputChain,
                            })
                            forceRefresh(Math.random())
                        }}
                        inputToken={inputToken}
                        outputToken={outputToken}
                    />

                    {slippage && slippage < tokenTax && (
                        <div className="bg-dark border-2 border-warning p-3 rounded-xl text-center text-light-200 my-3 font-bold">
                            The slippage you have selected is less than what you
                            will need for token taxes. This means the
                            transaction will most likely fail. Please make sure
                            the slippage includes all token taxes (which is{' '}
                            {tokenTax}%).
                        </div>
                    )}

                    {swapSuccessTx && (
                        <div className="bg-dark border-2 border-success p-3 rounded-xl text-light-200 my-3">
                            <div className="flex mb-3 items-center justify-center">
                                <div className="flex-grow">
                                    Swap successful!
                                </div>
                                <ImCross
                                    className="cursor-pointer hover:text-activeblue transition-colors"
                                    onClick={() => setSwapSuccessTx(undefined)}
                                />
                            </div>
                            <Link
                                target="_blank"
                                href={`${
                                    chainsInfo[
                                        swapSuccessTx?.inputChain !==
                                        swapSuccessTx?.outputChain
                                            ? swapSuccessTx?.inputChain
                                            : swapSuccessTx?.outputChain
                                    ].explorer
                                }tx/${swapSuccessTx.tx}`}
                                className="hover:underline bg-broccoli p-3 rounded-xl text-white mt-2 cursor-pointer border-success border-2 hover:bg-success font-bold transition-colors block text-center"
                            >
                                View on explorer{' '}
                                <GoLinkExternal className="inline" />
                            </Link>
                            {swapSuccessTx?.inputChain !==
                                swapSuccessTx?.outputChain && (
                                <div
                                    onClick={() =>
                                        props.setShowRecentTrades?.(true)
                                    }
                                    className="hover:underline bg-broccoli p-3 rounded-xl text-white mt-2 cursor-pointer border-success border-2 hover:bg-success font-bold transition-colors block text-center"
                                >
                                    View Bridge Status
                                </div>
                            )}
                        </div>
                    )}
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
