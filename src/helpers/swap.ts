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
                    gasCalculation: 'calculate'
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
                    gasCalculation: 'calculate'
                }
            ),
        ]);

        const availableTrades = trades
            .filter(
                // @ts-expect-error error type
                (trade): trade is OnChainTrade => !trade?.error
            )
            .filter(trade => !['PangolinTrade', 'JoeTrade', 'XyDexTrade'].includes(trade.constructor.name))
            .sort((a, b) =>
                a.to.tokenAmount.toNumber() > b.to.tokenAmount.toNumber() ? -1 : 1
            ) as OnChainTrade[]

        const availableTradesWithoutProxy = tradesWithoutProxy
            .filter(
                // @ts-expect-error error type
                (trade): trade is OnChainTrade => !trade?.error
            )
            .filter(trade => !['XyDexTrade'].includes(trade.constructor.name))
            .sort((a, b) =>
                a.to.tokenAmount.toNumber() > b.to.tokenAmount.toNumber() ? -1 : 1
            ) as OnChainTrade[]

        const allTrades = availableTrades.concat(availableTradesWithoutProxy)

        if (allTrades.length === 0) return 'No trades available'

        // Filter trades where the min output amount is way too low
        const minimumMinimumOutputAmount = allTrades[0].toTokenAmountMin.tokenAmount.toNumber() * 0.95;
        const allValidTrades = allTrades.filter(trade => trade.toTokenAmountMin.tokenAmount.toNumber() >= minimumMinimumOutputAmount);
        return allValidTrades
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

    const availableTrades = trades
        .filter(
            // @ts-expect-error error type
            (trade): trade is OnChainTrade => !trade?.error
        )
        .filter(trade => !!trade?.trade?.to)
        .sort((a, b) =>
            a.trade!.to.tokenAmount.toNumber() > b.trade!.to.tokenAmount.toNumber() ? -1 : 1
        )
        // @ts-expect-error onChainTrade is not a prop but exists sometimes
        .filter(trade => !trade.trade?.onChainTrade || !['PangolinTrade', 'JoeTrade', 'XyDexTrade'].includes(trade.trade?.onChainTrade.constructor.name))

    const availableTradesWithoutProxy = tradesWithoutProxy
        .filter(
            // @ts-expect-error error type
            (trade): trade is OnChainTrade => !trade?.error
        )
        .filter(trade => !['XyDexTrade'].includes(trade.constructor.name))
        .filter(trade => !!trade?.trade?.to)
        .sort((a, b) =>
            a.trade!.to.tokenAmount.toNumber() > b.trade!.to.tokenAmount.toNumber() ? -1 : 1
        )

    const tradesToUse = availableTrades.concat(availableTradesWithoutProxy);

    if (!tradesToUse || tradesToUse.length === 0) return 'No trades available'

    const allOnChainTrades = tradesToUse.map(tradeToUse => tradeToUse.trade);

    // Filter trades where the min output amount is way too low
    const minimumMinimumOutputAmount = allOnChainTrades[0]!.toTokenAmountMin.toNumber() * 0.95;
    const allValidTrades = allOnChainTrades.filter(trade => trade && trade.toTokenAmountMin.toNumber() >= minimumMinimumOutputAmount);
    return allValidTrades;
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
