import { Token, chainsInfo } from '@/types'
import { debounce } from './debounce'
import { BlockchainName, OnChainTrade } from 'rubic-sdk'
import { getSDK } from './rubic'
import { GoPlusTokenReponse, getTokenSecurity } from './goPlus'

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

let cancel: Function
const calculate = async (
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
            }
        ),
        cancelPromise,
    ])

    if (trade === 'cancelled') {
        return
    }

    // Goplus security
    const [inputGPSec, outputGPSec] = await Promise.all([
        getTokenSecurity(
            chainsInfo[inputToken.chain].id,
            inputToken.token.address
        ),
        getTokenSecurity(
            chainsInfo[outputToken.chain].id,
            outputToken.token.address
        ),
    ])

    setTradeLoading(false)
    callback({ trade, inputGPSec, outputGPSec })
}

const debouncedCalculate = debounce(calculate, 200)

export const calculateSwap = (
    inputToken: Token,
    outputToken: Token,
    inputAmount: number,
    slippage: number,
    setTradeLoading: (loading: boolean) => void
): Promise<{
    trade: Awaited<ReturnType<typeof calculateBestTrade>>
    cancel: Function
    inputGPSec: GoPlusTokenReponse
    outputGPSec: GoPlusTokenReponse
}> => {
    return new Promise(resolve => {
        debouncedCalculate(
            inputToken,
            outputToken,
            inputAmount,
            slippage,
            setTradeLoading,
            resolve
        )
    })
}
