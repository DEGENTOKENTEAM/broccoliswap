import { Chain, EVMToken, Token, chainsInfo } from '@/types'
import { debounce } from './debounce'
import { BLOCKCHAIN_NAME, CROSS_CHAIN_TRADE_TYPE, CrossChainTradeType, OnChainTrade, WrappedOnChainTradeOrNull } from 'rubic-sdk'
import { getSDK } from './rubic'
import { DGNX_ADDRESS, addressHasDisburserRewards } from './dgnx'
import { bridgeConfigs, getEstimation } from './celer'
import { guardEVM } from './guard'
import getSolToSolRoute from './solana/getSolToSolRoute'

const calculateBestSwap = async (
    slippage: number,
    inputToken: EVMToken,
    fromAmount: number,
    inputTokenSellTax: number,
    outputToken: EVMToken,
    connectedAddress?: string
) => {
    const fromToken = {
        blockchain: chainsInfo[inputToken.chain].rubicSdkChainName,
        address: inputToken.token.address,
    }

    const toToken = {
        blockchain: chainsInfo[outputToken.chain].rubicSdkChainName,
        address: outputToken.token.address,
    }

    // Check if we need to disable proxy for legacy disburser DGNX holders
    // Also disable if the sell tex >0.5. That implies a token with a tax
    // and Rubic doesn't like that.
    let disabledProxy = false;
    let isDisburserAddress = false;
    if (connectedAddress && toToken.address === DGNX_ADDRESS && toToken.blockchain === 'AVALANCHE') {
        isDisburserAddress = await addressHasDisburserRewards(connectedAddress)
        disabledProxy = isDisburserAddress || inputTokenSellTax > 0.5
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
                (trade): trade is WrappedOnChainTradeOrNull => !trade?.error
            )

            .map(t => t?.trade)
            .filter(
                (trade): trade is OnChainTrade => !!trade
            )
            .filter(trade => !['PangolinTrade', 'JoeTrade', 'XyDexTrade'].includes(trade.constructor.name))
            .filter(trade => trade?.type !== 'XY_DEX')
            .sort((a, b) =>
                a.to.tokenAmount.toNumber() > b.to.tokenAmount.toNumber() ? -1 : 1
            ) as OnChainTrade[]

        const availableTradesWithoutProxy = tradesWithoutProxy
            .filter(
                (trade): trade is WrappedOnChainTradeOrNull => !trade?.error
            )
            .map(t => t?.trade)
            .filter(
                (trade): trade is OnChainTrade => !!trade
            )
            .filter(trade => !['XyDexTrade'].includes(trade.constructor.name))
            .sort((a, b) =>
                a.to.tokenAmount.toNumber() > b.to.tokenAmount.toNumber() ? -1 : 1
            ) as OnChainTrade[]

        const allTrades = availableTrades.concat(availableTradesWithoutProxy);

        if (allTrades.length === 0) return 'No trades available'

        // Filter trades where the min output amount is way too low
        const minimumMinimumOutputAmount = allTrades[0].toTokenAmountMin.tokenAmount.toNumber() * 0.95;
        const allValidTrades = allTrades.filter(trade => trade.toTokenAmountMin.tokenAmount.toNumber() >= minimumMinimumOutputAmount);
        console.log(allValidTrades)
        return { type: 'swap' as const, trades: allValidTrades }
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
        .sort((a, b) => {
            // If debridge, put in first
            if (a.tradeType === CROSS_CHAIN_TRADE_TYPE.DEBRIDGE) return -1
            return a.trade!.to.tokenAmount.toNumber() > b.trade!.to.tokenAmount.toNumber() ? -1 : 1
        })
        // @ts-expect-error onChainTrade is not a prop but exists sometimes
        .filter(trade => !trade.trade?.onChainTrade || !['PangolinTrade', 'JoeTrade', 'XyDexTrade'].includes(trade.trade?.onChainTrade.constructor.name))

    const availableTradesWithoutProxy = tradesWithoutProxy
        .filter(
            // @ts-expect-error error type
            (trade): trade is OnChainTrade => !trade?.error
        )
        .filter(trade => !['XyDexTrade'].includes(trade.constructor.name))
        .filter(trade => !!trade?.trade?.to)
        .sort((a, b) => {
            // If debridge, put in first
            if (a.tradeType === CROSS_CHAIN_TRADE_TYPE.DEBRIDGE) return -1
            return a.trade!.to.tokenAmount.toNumber() > b.trade!.to.tokenAmount.toNumber() ? -1 : 1
        })

    const tradesToUse = availableTrades.concat(availableTradesWithoutProxy);

    if (!tradesToUse || tradesToUse.length === 0) return 'No trades available'

    const allOnChainTrades = tradesToUse.map(tradeToUse => tradeToUse.trade);

    console.log(allOnChainTrades)

    // Filter trades where the min output amount is way too low
    const minimumMinimumOutputAmount = allOnChainTrades[0]!.toTokenAmountMin.toNumber() * 0.95;
    const allValidTrades = allOnChainTrades.filter(trade => trade && trade.toTokenAmountMin.toNumber() >= minimumMinimumOutputAmount);
    return { type: 'swap' as const, trades: allValidTrades };
};

const isBridgeRequest = (
    inputChain?: Chain,
    inputToken?: string,
    outputChain?: Chain,
    outputToken?: string
) => {
    if (!inputChain || !outputChain || !inputToken || !outputToken) {
        return false;
    }

    // Try to find a Celer bridge config
    const bridgeConfig = bridgeConfigs.find((config) => {
        if (config.org_chain_id === chainsInfo[inputChain].id &&
            config.org_token.token.address.toLowerCase() === inputToken.toLowerCase() &&
            config.pegged_chain_id === chainsInfo[outputChain].id &&
            config.pegged_token.token.address.toLowerCase() === outputToken.toLowerCase()
        ) {
            return true;
        }
    });

    if (bridgeConfig) {
        return bridgeConfig;
    }

    return false
}

const calculateBestBridge = async (
    slippage: number,
    inputToken: EVMToken,
    fromAmount: number,
    inputTokenSellTax: number,
    outputToken: EVMToken,
    bridgeConfig: typeof bridgeConfigs[number],
    connectedAddress?: string
) => {
    try {
        const estimation = await getEstimation(
            chainsInfo[inputToken.chain].id,
            chainsInfo[outputToken.chain].id,
            bridgeConfig.org_token.token.symbol,
            fromAmount,
            bridgeConfig.org_token.token.decimal,
            slippage,
        );
        return { type: 'bridge' as const, result: 'success' as const, bridgeConfig, estimation };
    } catch (e: any) {
        return { type: 'bridge' as const, result: 'error' as const, error: e.message }
    }
}

const calculateBestTrade = async (
    slippage: number,
    inputToken: Token,
    fromAmount: number,
    inputTokenSellTax: number,
    outputToken: Token,
    connectedAddress?: string
) => {
    if (inputToken.type === 'solana' && outputToken.type === 'solana') {
        const route = await getSolToSolRoute(
            inputToken,
            outputToken,
            fromAmount,
            slippage
        );
        return { type: 'sol2sol' as const, route, inputToken, outputToken };
    } else if (inputToken.type === 'solana' || outputToken.type === 'solana') {
        console.log('Calculate sol bridge')
        return;
    }

    // Check if this is a bridge or a swap
    const bridgeRequest = isBridgeRequest(
        inputToken.chain,
        inputToken.token.address,
        outputToken.chain,
        outputToken.token.address
    );
    if (bridgeRequest) {
        return calculateBestBridge(
            slippage,
            inputToken,
            fromAmount,
            inputTokenSellTax,
            outputToken,
            bridgeRequest,
            connectedAddress
        )
    }

    return calculateBestSwap(
        slippage,
        inputToken,
        fromAmount,
        inputTokenSellTax,
        outputToken,
        connectedAddress
    );
}

let cancel: Function
const calculate = async (
    connectedAddress: string | undefined,
    inputToken: Token,
    outputToken: Token,
    inputAmount: number,
    inputTokenSellTax: number,
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
            inputToken,
            inputAmount,
            inputTokenSellTax,
            outputToken,
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
    inputTokenSellTax: number,
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
            inputTokenSellTax,
            slippage,
            setTradeLoading,
            resolve
        )
    })
}
