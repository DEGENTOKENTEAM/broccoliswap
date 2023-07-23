import { Token, chainsInfo } from '@/types'
import { debounce } from './debounce'
import { BlockchainName, OnChainTrade } from 'rubic-sdk'
import { getSDK } from './rubic'

const calculateBestTrade = async (
    slippage: number,
    fromToken: { blockchain: BlockchainName; address: string },
    fromAmount: number,
    toToken: { blockchain: BlockchainName; address: string }
) => {
    const sdk = await getSDK()
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
                useProxy: true,
                deadlineMinutes: 20,
            }
        )

        const availableTrades = trades.filter(
            // @ts-expect-error error type
            (trade): trade is OnChainTrade => !trade?.error
        )
        if (availableTrades.length === 0) return 'No trades available'
        return availableTrades.sort((a, b) =>
            a.to.tokenAmount > b.to.tokenAmount ? -1 : 1
        )[0] as OnChainTrade
    }
    const trades = await sdk.crossChainManager.calculateTrade(
        fromToken,
        fromAmount,
        toToken
    )

    const bestTrade = trades
        .filter(trade => !!trade?.trade?.to)
        .sort((a, b) =>
            a.trade!.to.tokenAmount > b.trade!.to.tokenAmount ? -1 : 1
        )[0]
    if (!bestTrade) return 'No trades available'
    return bestTrade.trade || 'Something went wrong'
}

const calculate = async (
    inputToken: Token,
    outputToken: Token,
    inputAmount: number,
    slippage: number,
    callback: Function
) => {
    let cancel
    const cancelPromise = new Promise((resolve, reject) => {
        cancel = reject.bind(null, { canceled: true })
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
            }
        ),
        cancelPromise,
    ])
    callback({ trade, cancel })
}

const debouncedCalculate = debounce(calculate, 2000)

export const calculateSwap = (
    inputToken: Token,
    outputToken: Token,
    inputAmount: number,
    slippage: number
): Promise<{
    trade: Awaited<ReturnType<typeof calculateBestTrade>>
    cancel: Function
}> => {
    return new Promise(resolve => {
        debouncedCalculate(
            inputToken,
            outputToken,
            inputAmount,
            slippage,
            resolve
        )
    })
}
