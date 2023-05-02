import Image from "next/image"; 
import { SDK, BLOCKCHAIN_NAME, Configuration, WalletProvider, CHAIN_TYPE, BlockchainName, OnChainTrade, CrossChainTrade, WrappedCrossChainTrade } from 'rubic-sdk';
import { rubicNetworkToBitqueryNetwork, rubicRPCEndpoints, rubicTokenNetworkToBlockchain, rubicTokenNetworkToChainId, SearchResult, SwapSide, Token, wagmiNetworkIdToRubicNetwork } from "@/types"
import { SearchToken } from "./SearchToken";
import { useCallback, useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MdSwapVert } from "react-icons/md"
import { Chain, useAccount, useBalance, useNetwork, useProvider } from "wagmi";
import { debounce } from "@/helpers/debounce";
import { Spinner } from "./Spinner";
import { toPrecision } from "@/helpers/number";
import { SwapSettings } from "./SwapSettings";
import { SwapButton } from "./SwapButton";
import { SwapDetails } from "./SwapDetails";

const getMinimumOutputAmount = (trade: OnChainTrade | CrossChainTrade) => {
    if (trade.from.blockchain === trade.to.blockchain) {
        return (trade as OnChainTrade).toTokenAmountMin.tokenAmount;
    }

    return (trade as CrossChainTrade).toTokenAmountMin;
}

const getPriceImpact = (trade: OnChainTrade | CrossChainTrade) => {
    if (trade.from.blockchain === trade.to.blockchain) {
        return (trade as OnChainTrade).priceImpact || 0;
    }

    // @ts-ignore
    return Number((trade as CrossChainTrade).priceImpact);
}

const setupRubic = async (walletProvider?: WalletProvider) => {
    const config: Configuration = {
        rpcProviders: rubicRPCEndpoints,
        walletProvider,
    };
    const rubicSDK = SDK.createSDK(config)
    return rubicSDK;
}

const calculateBestTrade = async (
    sdk: SDK,
    slippage: number,
    fromToken: { blockchain: BlockchainName, address: string },
    fromAmount: number,
    toToken: { blockchain: BlockchainName, address: string },
) => {
    if (fromToken.blockchain === toToken.blockchain) {
        const trades = await sdk.onChainManager.calculateTrade(
            fromToken,
            fromAmount,
            toToken.address,
            {
                timeout: 10000,
                gasCalculation: 'disabled',
                slippageTolerance: slippage / 100,
                disableMultihops: false,
                useProxy: false,
                deadlineMinutes: 20
            }
        );

        // @ts-ignore error type
        const availableTrades = trades.filter((trade): trade is OnChainTrade => !(trade)?.error);
        if (availableTrades.length === 0) return 'No trades available'
        return availableTrades.sort((a, b) => a.to.tokenAmount > b.to.tokenAmount ? -1 : 1)[0] as OnChainTrade;
    }
    const trades = await sdk.crossChainManager.calculateTrade(
        fromToken,
        fromAmount,
        toToken
    );
    console.log(trades)
    const bestTrade = trades.filter(trade => !!trade?.trade?.to).sort((a, b) => a.trade!.to.tokenAmount > b.trade!.to.tokenAmount ? -1 : 1)[0];
    if (trades.length === 0) return 'No trades available'
    return bestTrade.trade || 'Something went wrong';
}

const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD"
})

const ActiveToken = (props: { token: Token, amount?: number, setAmount?: (amount: number) => void }) => {
    const { address, isConnected } = useAccount()
    const setAmountInputRef = useRef<HTMLInputElement>(null)
    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token: props.token.address,
        chainId: rubicTokenNetworkToChainId[props.token.network as keyof typeof rubicTokenNetworkToChainId]
    })
    console.log(balanceData)

    return (
        <div className="bg-slate-900 border border-orange-900 p-3 my-2 flex items-center gap-2 text-sm">
            {props.token.image  && <Image src={props.token.image} unoptimized width="25" height="25" alt={props.token.name} />}
            <div className="flex-grow">
                <div className="flex flex-col">
                    <div className="text-xs -mb-1.5">{(rubicNetworkToBitqueryNetwork as any)[props.token.network]}</div>
                    <div>{props.token.symbol}</div>
                    <div className="text-xs">{balanceIsLoading ? <Spinner /> : balanceData && (
                        <div className="flex gap-1 items-center">
                            <span>Balance: {toPrecision(parseFloat(balanceData.formatted), 4)}</span>
                            {props.setAmount && (
                                <span>
                                    (
                                        <span
                                            onClick={() => {
                                                props.setAmount!(parseFloat(balanceData.formatted) || 0);
                                                setAmountInputRef.current!.value = balanceData.formatted
                                            }}
                                            className="underline cursor-pointer">
                                                max
                                        </span>
                                    )
                                </span>
                            )}
                        </div>
                    )}</div>
                </div>
            </div>
            <div className="flex flex-col justify-end">
                {props.setAmount && <div>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="appearance-none w-full p-1 text-sm bg-transparent text-right text-gray-400 focus:outline-none"
                        style={{ 'appearance': 'none' }}
                        placeholder="Amount"
                        onChange={(e) => props.setAmount!(parseFloat(e.target.value))}
                        defaultValue={props.amount ? props.amount : undefined}
                        ref={setAmountInputRef}
                    />
                </div>}
                <div className="text-xs text-right">{props.token.price ? formatter.format((props.amount || 1) * parseFloat(props.token.price)) : '...'}</div>
            </div>
        </div>
    )
}

const OtherToken = (props: { token: Token, removeToken: Function, amount?: number, setAmount?: (amount: number) => void }) => {
    const { address, isConnected } = useAccount()
    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token: props.token.address !== '0x0000000000000000000000000000000000000000' ? props.token.address : undefined,
        chainId: rubicTokenNetworkToChainId[props.token.network as keyof typeof rubicTokenNetworkToChainId]
    })

    return (
        <div className="relative bg-slate-900 border border-orange-900 p-3 my-2 flex items-center gap-2 text-sm group">
            {props.token.image && <Image src={props.token.image} unoptimized width="25" height="25" alt={props.token.name} />}
            <div className="flex-grow">
                <div className="flex flex-col">
                    <div className="text-xs -mb-1.5">{(rubicNetworkToBitqueryNetwork as any)[props.token.network]}</div>
                    <div>{props.token.symbol}</div>
                    <div className="text-xs">{balanceIsLoading ? <Spinner /> : balanceData && `Balance: ${toPrecision(parseFloat(balanceData.formatted), 4)}`}</div>
                </div>
            </div>
            <div className="flex flex-col justify-end">
                {props.setAmount && <div>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="appearance-none w-full p-1 text-sm bg-transparent text-right text-gray-400 focus:outline-none"
                        style={{ 'appearance': 'none' }}
                        placeholder="Amount"
                        onChange={(e) => props.setAmount!(parseFloat(e.target.value))}
                        defaultValue={props.amount ? props.amount : undefined}
                    />
                </div>}
                <div className="text-xs text-right">{props.token.price ? formatter.format((props.amount || 1) * parseFloat(props.token.price)) : '...'}</div>
            </div>
            <div className="absolute top-0 right-0 group-hover:opacity-100 opacity-0 cursor-pointer text-white bg-orange-600 w-5 h-5 flex items-center justify-center p-0" onClick={() => props.removeToken()}>
                <XMarkIcon />
            </div>
        </div>
    )
}

const OtherTokenSelector = (props: { otherToken?: Token | null, setOtherToken: (token: Token | null) => void, amount?: number, setAmount?: (amount: number) => void }) => {
    return <>
        {props.otherToken
            ? <OtherToken amount={props.amount} setAmount={props.setAmount} token={props.otherToken} removeToken={() => props.setOtherToken(null)} />
            : <SearchToken setActiveToken={props.setOtherToken} inputClassName="py-2 my-2" includeNative={true} />
        }
    </>
}

const getTrades = async (sdk: SDK, slippage: number, amount: number, otherToken: Token, swapSide: SwapSide, activeToken: Token) => {
    const fromToken = swapSide === SwapSide.LEFT
        ? { blockchain: (rubicTokenNetworkToBlockchain as any)[activeToken.network], address: activeToken.address }
        : { blockchain: (rubicTokenNetworkToBlockchain as any)[otherToken.network], address: otherToken.address }

    const toToken = swapSide === SwapSide.LEFT
        ? { blockchain: (rubicTokenNetworkToBlockchain as any)[otherToken.network], address: otherToken.address }
        : { blockchain: (rubicTokenNetworkToBlockchain as any)[activeToken.network], address: activeToken.address }

    try {
        const wrappedTrade = await calculateBestTrade(sdk, slippage, fromToken, amount, toToken)
        console.log(wrappedTrade)
        return wrappedTrade
    } catch (e: any) {
        console.log(e)
        return 'Something went wrong'
    }
}

export const Swap = (props: { activeToken: Token }) => {
    const [otherToken, setOtherToken] = useState<Token | null>()
    const [swapSide, setSwapSide] = useState<SwapSide>(SwapSide.RIGHT)
    const [amount, setAmount] = useState<number>();
    const [sdk, setSDK] = useState<SDK>();
    const [sdkInitialized, setSdkInitialized] = useState(false)
    const [trade, setTrade] = useState<OnChainTrade | CrossChainTrade | string>()
    const [tradeLoading, setTradeLoading] = useState(false)
    const [slippage, setSlippage] = useState(1);
    const provider = useProvider()

    const debouncedSetAmount = useCallback(
        debounce((amount: number) => {
            setAmount(amount)
        }),
        []
    )

    const { address, isConnected } = useAccount()
    const { chain } = useNetwork()


    useEffect(() => {
        setupRubic().then((sdk) => {
            setSDK(sdk)
            setSdkInitialized(true)
        })
    }, [])

    useEffect(() => {
        if (!sdkInitialized || !sdk || !address || !chain) return;
        console.log('updating config')
        sdk.updateWalletProviderCore(CHAIN_TYPE.EVM, { core: window.ethereum!, address });

    }, [sdk, sdkInitialized, address, chain])
    
    useEffect(() => {
        if (!sdk || !otherToken || !amount) return;
        
        setTradeLoading(true)
        getTrades(sdk, slippage, amount, otherToken, swapSide, props.activeToken)
            .then((trade) => {
                setTrade(trade)
                setTradeLoading(false)
            })
    }, [sdk, slippage, address, amount, otherToken, swapSide, props.activeToken])

    console.log('trade',trade)

    return (
        <div className="text-slate-200 border-l border-zinc-800 h-full px-3">
            <div className="flex items-center">
                <h2 className="text-xl flex-grow">Swap</h2>
                <div>
                    <SwapSettings slippage={slippage} setSlippage={setSlippage}/>
                </div>
            </div>
            <h3>From</h3>
            {swapSide === SwapSide.LEFT
                ? <ActiveToken token={props.activeToken} setAmount={debouncedSetAmount} amount={amount} />
                : <OtherTokenSelector otherToken={otherToken} setAmount={debouncedSetAmount} amount={amount} setOtherToken={setOtherToken} />
            }
            {<div className="flex justify-center text-white text-2xl">
                <MdSwapVert
                    className="hover:cursor-pointer hover:text-orange-600"
                    onClick={() => {
                        swapSide === SwapSide.LEFT
                            ? setSwapSide(SwapSide.RIGHT)
                            : setSwapSide(SwapSide.LEFT)
                    }}
                />
            </div>}
            <h3>To</h3>
            {swapSide === SwapSide.RIGHT
                ? <ActiveToken token={props.activeToken} />
                : <OtherTokenSelector otherToken={otherToken} setOtherToken={setOtherToken} />
            }
            <div className="mt-3">
                {tradeLoading
                    ? <Spinner />
                    : trade && (
                        <div className="w-full flex justify-center flex-col">
                            {typeof trade === 'string' && <p>{trade}</p>}
                            {typeof trade === 'object' && (
                                <>
                                    <SwapButton trade={trade} />
                                </>
                            )}
                        </div>
                    )
                }
            </div>

            {trade && typeof trade === 'object' && <SwapDetails
                inputAmount={toPrecision(trade.from.tokenAmount.toNumber(), 4)}
                outputAmount={toPrecision(trade.to.tokenAmount.toNumber(), 4)}
                inputName={trade.from.symbol}
                outputName={trade.to.symbol}
                slippage={slippage}
                minimumOutputAmount={toPrecision(getMinimumOutputAmount(trade).toNumber(), 4)}
                priceImpact={getPriceImpact(trade)}
                fromTokenPrice={swapSide === SwapSide.LEFT ? props.activeToken.price : otherToken?.price}
                toTokenPrice={swapSide === SwapSide.LEFT ? otherToken?.price : props.activeToken.price}
            />}
        </div>
    )
}