import { Token, chainsInfo } from '@/types'
import { debounce } from './debounce'
import { BlockchainName, CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType, OnChainTrade } from 'rubic-sdk'
import { getSDK } from './rubic'
import { GoPlusTokenReponse, getTokenSecurity } from './goPlus'
import { DGNX_ADDRESS, addressHasDisburserRewards } from './dgnx'

const calculateBestTrade = async (
    slippage: number,
    fromToken: { blockchain: BlockchainName; address: string },
    fromAmount: number,
    toToken: { blockchain: BlockchainName; address: string },
    connectedAddress?: string
) => {
    // Check if we need to disable proxy for legacy disburser DGNX holders
    let disabledProxy = false;
    if (connectedAddress && toToken.address === DGNX_ADDRESS && toToken.blockchain === 'AVALANCHE') {
        disabledProxy = await addressHasDisburserRewards(connectedAddress)
    }

    const sdk = await getSDK()
    if (fromToken.blockchain === toToken.blockchain) {
        const [trades, tradesWithoutProxy] = await Promise.all([
            disabledProxy ? [] as unknown as ReturnType<typeof sdk.onChainManager.calculateTrade> : sdk.onChainManager.calculateTrade(
                fromToken,
                fromAmount,
                toToken.address,
                {
                    timeout: 10000,
                    slippageTolerance: slippage / 100,
                    disableMultihops: false,
                    useProxy: true,
                    deadlineMinutes: 20,
                }
            ),
            sdk.onChainManager.calculateTrade(
                fromToken,
                fromAmount,
                toToken.address,
                {
                    timeout: 10000,
                    slippageTolerance: slippage / 100,
                    disableMultihops: false,
                    useProxy: false,
                    deadlineMinutes: 20,
                }
            ),
        ]);

        const availableTrades = trades.filter(
            // @ts-expect-error error type
            (trade): trade is OnChainTrade => !trade?.error
        )

        const availableTradesWithoutProxy = tradesWithoutProxy.filter(
            // @ts-expect-error error type
            (trade): trade is OnChainTrade => !trade?.error
        )

        const tradesToUse = availableTrades.length > 0 ? availableTrades : availableTradesWithoutProxy;
        const allTrades = tradesToUse
            .filter(trade => !['PangolinTrade', 'JoeTrade'].includes(trade.constructor.name))
            .sort((a, b) =>
                a.to.tokenAmount > b.to.tokenAmount ? -1 : 1
            ) as OnChainTrade[]

        if (allTrades.length === 0) return 'No trades available'
        return allTrades
    }

    const [trades, tradesWithoutProxy] = await Promise.all([
        disabledProxy ? [] : sdk.crossChainManager.calculateTrade(
            fromToken,
            fromAmount,
            toToken,
            {
                fromSlippageTolerance: slippage / 100,
                toSlippageTolerance: slippage / 100,
                slippageTolerance: slippage / 100,
                useProxy: Object.values(CROSS_CHAIN_TRADE_TYPE).reduce((acc, val) => {
                    acc[val] = true;
                    return acc;
                }, {} as Record<CrossChainTradeType, boolean>)
            }
        ),
        sdk.crossChainManager.calculateTrade(
            fromToken,
            fromAmount,
            toToken,
            {
                fromSlippageTolerance: slippage / 100,
                toSlippageTolerance: slippage / 100,
                slippageTolerance: slippage / 100,
                useProxy: Object.values(CROSS_CHAIN_TRADE_TYPE).reduce((acc, val) => {
                    acc[val] = false;
                    return acc;
                }, {} as Record<CrossChainTradeType, boolean>)
            }
        ),
    ]);

    const availableTradesWithoutProxy = tradesWithoutProxy.filter(
            // @ts-expect-error error type
            (trade): trade is OnChainTrade => !trade?.error
        )

    const tradesToUse = trades.length > 0 ? trades : availableTradesWithoutProxy;

    const bestTrades = tradesToUse
        .filter(trade => !!trade?.trade?.to)
        .sort((a, b) =>
            a.trade!.to.tokenAmount > b.trade!.to.tokenAmount ? -1 : 1
        )
        // @ts-expect-error onChainTrade is not a prop but exists sometimes
        .filter(trade => !trade.trade?.onChainTrade || !['PangolinTrade', 'JoeTrade'].includes(trade.trade?.onChainTrade.constructor.name))
    if (!bestTrades || bestTrades.length === 0) return 'No trades available'

    return bestTrades.map(bestTrade => bestTrade.trade);
}

let cancel: Function
const calculate = async (
    connectedAddress: string | undefined,
    inputToken: Token,
    outputToken: Token,
    inputAmount: number,
    slippage: number,
    setTradeLoading: (loading: boolean) => void,
    callback: Function
) => {
    setTradeLoading(true)

    cancel?.()

    const cancelPromise = new Promise<'cancelled'>((resolve, reject) => {
        cancel = resolve.bind(null, 'cancelled')
    })

    const trade = await Promise.race([
        calculateBestTrade(
            slippage,
            {
                blockchain: chainsInfo[inputToken.chain].rubicSdkChainName,
                address: inputToken.token.address,
            },
            inputAmount,
            {
                blockchain: chainsInfo[outputToken.chain].rubicSdkChainName,
                address: outputToken.token.address,
            },
            connectedAddress
        ),
        cancelPromise,
    ])

    if (trade === 'cancelled') {
        return
    }

    setTradeLoading(false)
    callback({ trade })
}

const debouncedCalculate = debounce(calculate, 200)

export const calculateSwap = (
    connectedAddress: string | undefined,
    inputToken: Token,
    outputToken: Token,
    inputAmount: number,
    slippage: number,
    setTradeLoading: (loading: boolean) => void
): Promise<{
    trade: Awaited<ReturnType<typeof calculateBestTrade>>
    cancel: Function
}> => {
    return new Promise(resolve => {
        debouncedCalculate(
            connectedAddress,
            inputToken,
            outputToken,
            inputAmount,
            slippage,
            setTradeLoading,
            resolve
        )
    })
}
