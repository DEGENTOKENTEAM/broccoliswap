import merge from 'deepmerge'
import { TokenInput } from '@/components/TokenInput'
import { SwapButton } from '@/components/SwapButton'
import { SwapTokens } from '@/components/SwapTokens'
import { Chain, NULL_ADDRESS, RubicToken, Token, chainsInfo } from '@/types'
import { useEffect, useMemo, useState } from 'react'
import { calculateSwap } from '@/helpers/swap'
import { useAsyncEffect } from '@/hooks/useAsyncEffect'
import { CHAIN_TYPE, CrossChainTrade, OnChainTrade } from 'rubic-sdk'
import { FaWallet } from 'react-icons/fa'
import { LuSettings2 } from 'react-icons/lu'
import { PiWarningBold } from 'react-icons/pi'
import { BsShareFill } from 'react-icons/bs'
import { BalanceAmount } from '@/components/BalanceAmount'
import { useAccount, useNetwork } from 'wagmi'
import { SlippageSelector } from '@/components/SlippageSelector'
import { getSDK, searchToken } from '@/helpers/rubic'
import { SwapHistory } from '@/components/SwapHistory'
import { RefreshButton } from '@/components/RefreshButton'
import { ExtraTradeInfo } from '@/components/ExtraTradeInfo'
import { getTokenSecurity } from '@/helpers/goPlus'
import { GoLinkExternal } from 'react-icons/go'
import Link from 'next/link'
import { ImCross } from 'react-icons/im'
import { getTokenTaxes } from '@/helpers/tokenTax'
import { useEthersSigner } from '@/hooks/useEthersSigner'
import { useWeb3Signer } from '@/hooks/useWeb3Signer'
import FeedbackButton from '@/components/FeedbackButton'

export const SwapView = (props: {
    showRecentTrades?: boolean
    setShowRecentTrades?: (show: boolean) => void
}) => {
    const [inputToken, setInputToken] = useState<Token | undefined>()
    const [inputChain, setInputChain] = useState<Chain>()
    const [shared, setShared] = useState(false);
    const [outputToken, setOutputToken] = useState<Token | undefined>()
    const [outputChain, setOutputChain] = useState<Chain>()
    const [inputAmount, setInputAmount] = useState<number>()

    const [inputTokenSellTax, setInputTokenSellTax] = useState<number>()
    const [outputTokenBuyTax, setOutputTokenBuyTax] = useState<number>()

    const [temp, setTemp] = useState('');
    const updateTemp = (text: string)=>{
        setTemp(_t => `${_t} | ${text}`)
    }

    const signer = useEthersSigner()
    const { chain } = useNetwork();
    const web3 = useWeb3Signer({ chainId: chain?.id });


    const [slippage, setSlippage] = useState<number>()

    const [swapSuccessTx, setSwapSuccessTx] = useState<{
        tx: string
        inputChain: Chain
        outputChain: Chain,
        inputToken: Token,
        outputToken: Token,
    }>()

    const [forceRefreshVar, forceRefresh] = useState(0)

    const [showSlippageSelector, setShowSlippageSelector] = useState(false)
    const [maxExplainerVisible, setMaxExplainerVisible] = useState(false)

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

    const addTokenToWallet = (token: Token) => {
        // @ts-ignore
        window.ethereum?.request({
            "method": "wallet_watchAsset",
            "params": {
                // @ts-ignore
                "type": "ERC20",
                "options": {
                "address": token.token.address,
                "symbol": token.token.symbol,
                "decimals": token.token.decimals,
                "image": token.token.image
                }
            }
        });
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
        if (!address || !inputChain || !signer) {
            return;
        }

        (await getSDK()).updateWalletProviderCore(CHAIN_TYPE.EVM, {
            core: web3,
            address,
        })
        forceRefresh(Math.random())
    }, [address, inputChain, signer])

    useEffect(() => {
        setSlippage(undefined);
    }, [inputToken, outputToken])

    useAsyncEffect(async () => {
        if (!inputToken || !outputToken || !inputAmount) {
            return
        }

        setTrades(undefined)

        let _inputTokenSellTax;
        let _outputTokenBuyTax;

        const [inputTokenTaxes, outputTokenTaxes] = await Promise.all([
            getTokenTaxes(
                inputToken.chain,
                inputToken.token.address,
            ),
            getTokenTaxes(
                outputToken.chain,
                outputToken.token.address,
            ),
        ]);

        if (inputTokenTaxes.sellTax === -1 || outputTokenTaxes.buyTax === -1) {
            // Goplus security
            const [_inputGPSec, _outputGPSec] = await Promise.all([
                getTokenSecurity(
                    chainsInfo[inputToken.chain].id,
                    inputToken.token.address
                ),
                getTokenSecurity(
                    chainsInfo[outputToken.chain].id,
                    outputToken.token.address
                ),
            ])

            _inputTokenSellTax = _inputGPSec.sell_tax;
            _outputTokenBuyTax = _outputGPSec.buy_tax;
        } else {
            _inputTokenSellTax = inputTokenTaxes.sellTax;
            _outputTokenBuyTax = outputTokenTaxes.buyTax;
        }

        setInputTokenSellTax(_inputTokenSellTax);
        setOutputTokenBuyTax(_outputTokenBuyTax);
        

        let tradeSlippage = slippage;
        if (!tradeSlippage) {
            tradeSlippage = (_inputTokenSellTax + _outputTokenBuyTax + (inputToken.chain  === outputToken.chain ? 1 : 4));

            if (_inputTokenSellTax + _outputTokenBuyTax > 6) {
                tradeSlippage += 1;
            }
            
            setSlippage(tradeSlippage)
        }

        const {
            trade: _trades,
        } = await calculateSwap(
            address,
            inputToken,
            outputToken,
            inputAmount,
            tradeSlippage,
            setTradeLoading
        )

        setTrades(_trades)
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
            amount = Math.max(0, amount - 0.1)

            // Max the explainer visible for 5 sec
            if (!localStorage.getItem('maxExplainerShown')) {
                setMaxExplainerVisible(true);
                setTimeout(() => setMaxExplainerVisible(false), 5000);
                localStorage.setItem('maxExplainerShown', 'yes')
            }
        }

        setInputAmount(amount)
        setExternallySetAmount(amount)
    }

    const tokenTax = useMemo(() => {
        return (inputTokenSellTax || 0) + (outputTokenBuyTax || 0)
    }, [inputTokenSellTax, outputTokenBuyTax])

    return (
        <>
            <div className="flex flex-grow flex-col mt-24 sm:mt-20 mx-5 mb-5 gap-3">
                <div className="flex h-8 gap-2">
                    <RefreshButton
                        tradeLoading={tradeLoading}
                        interval={60}
                        refreshFn={() => forceRefresh(Math.random())}
                    />
                    <FeedbackButton />
                    <div className="flex-grow"></div>
                    {inputToken && outputToken && inputAmount && (
                        <div
                            onClick={() => {
                                setShared(true);
                                setTimeout(() => setShared(false), 3000);
                                navigator.clipboard.writeText(`https://broccoliswap.com/?inputToken=${inputToken.token.address}&inputChain=${inputToken.chain}&outputToken=${outputToken.token.address}&outputChain=${outputToken.chain}&amount=${inputAmount}`);
                            }}
                            className="bg-darkblue transition-all px-2 py-0.5 rounded-full cursor-pointer border-2 border-activeblue hover:bg-activeblue flex gap-1 items-center text-xs">
                            <BsShareFill />
                            {shared && <span>Copied link</span>}
                        </div>
                    )}
                    {slippage && <div
                        onClick={() => setShowSlippageSelector(true)}
                        className="bg-darkblue px-2 py-0.5 rounded-full cursor-pointer border-2 border-activeblue transition-colors hover:bg-activeblue flex gap-1 items-center text-xs"
                    >
                        <LuSettings2 />
                        {slippage.toFixed(2)}%
                        {(slippage < tokenTax || slippage - tokenTax > 10) && (
                            <PiWarningBold className="text-warning" />
                        )}
                    </div>}
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
                        (inputBalance > 0.1 ||
                            inputToken.token.address !== NULL_ADDRESS) ? (
                            <div
                                onClick={() =>
                                    setInputFromBalance(
                                        0.5,
                                        chainsInfo[inputToken.chain].id,
                                        inputToken.token.address
                                    )
                                }
                                className="text-xs px-2 bg-darkblue rounded-full border border-activeblue cursor-pointer hover:bg-activeblue transition-colors"
                            >
                                HALF
                            </div>
                        ) : null}
                        {inputToken &&
                        address &&
                        inputBalance &&
                        (inputBalance > 0.1 ||
                            inputToken.token.address !== NULL_ADDRESS) ? (
                            <div
                                onClick={() =>
                                    setInputFromBalance(
                                        1,
                                        chainsInfo[inputToken.chain].id,
                                        inputToken.token.address
                                    )
                                }
                                className="text-xs px-2 bg-darkblue rounded-full border border-activeblue cursor-pointer hover:bg-activeblue transition-colors"
                            >
                                MAX
                            </div>
                        ) : null}
                    </div>
                    {maxExplainerVisible && <div className="text-xs flex justify-end mt-1">
                        We make sure at least 0.1 {inputToken?.token.symbol} is in your wallet for gas fees.
                    </div>}
                    <TokenInput
                        selectedChain={inputChain}
                        setSelectedChain={setInputChain}
                        token={inputToken}
                        setToken={setInputToken}
                        setInputAmount={setInputAmount}
                        amount={inputAmount}
                        externalAmount={externallySetAmount}
                        otherToken={outputToken}
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
                        otherToken={inputToken}
                    />

                    <SwapButton
                    updateTemp={updateTemp}
                        tradeLoading={tradeLoading}
                        trades={trades}
                        onSwapDone={(
                            tx: string,
                            swapInputChain: Chain,
                            swapOutputChain: Chain,
                            swapInputToken: Token,
                            swapOutputToken: Token
                        ) => {
                            setSwapSuccessTx({
                                tx,
                                inputChain: swapInputChain,
                                outputChain: swapOutputChain,
                                inputToken: swapInputToken,
                                outputToken: swapOutputToken,
                            })
                            forceRefresh(Math.random())
                        }}
                        inputToken={inputToken}
                        outputToken={outputToken}
                        inputTokenSellTax={inputTokenSellTax}
                        inputAmountInUsd={(inputAmount && inputToken) ? inputAmount * parseFloat(inputToken.token.usdPrice) : undefined}
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

                            {swapSuccessTx?.inputChain === swapSuccessTx?.outputChain
                                && swapSuccessTx.outputToken.token.address !== NULL_ADDRESS
                                && <button
                                onClick={() => addTokenToWallet(swapSuccessTx.outputToken)}
                                className="flex items-center w-full gap-1 justify-end text-success underline hover:no-underline mt-3"
                            >
                                Add output token to wallet
                                <GoLinkExternal className="inline" />
                            </button>}
                        </div>
                    )}
                </div>
                
                <ExtraTradeInfo trade={trades?.[0]} />
                {temp}
            </div>

            <SlippageSelector
                show={showSlippageSelector}
                setShow={setShowSlippageSelector}
                slippage={slippage}
                setSlippage={setSlippage}
                tokenTax={tokenTax}
                inputTokenSellTax={inputTokenSellTax}
                outputTokenBuyTax={outputTokenBuyTax}
                isBridge={inputToken?.chain !== outputToken?.chain}
            />

            <SwapHistory
                show={props.showRecentTrades}
                setShow={props.setShowRecentTrades}
            />
        </>
    )
}
