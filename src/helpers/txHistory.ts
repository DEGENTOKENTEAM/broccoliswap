import { Chain, chainsInfo } from '@/types'
import { CrossChainTradeType, TX_STATUS, TxStatus } from 'rubic-sdk'
import { getSDK } from './rubic'

export enum SwapType {
    ON_CHAIN = 'ON_CHAIN',
    CROSS_CHAIN = 'CROSS_CHAIN',
}

export type TxHistoryItem = {
    fromChain: Chain
    toChain: Chain
    swapTx: string
    fromAddress: string
    fromSymbol: string
    fromLogo: string
    toSymbol: string
    toAddress: string
    fromAmount: number
    toAmount: number
    toLogo: string
    date: number
    bridge?: string
    bridgeId?: string
    bridgeType?: string

    finalStatus?: TxStatus
    finalDstHash?: string

    bridgeToTokenInfo?: {
        status: string
        toAddress: string
        toTokenAddress: string
        toSymbol: string
        toAmount: number
    }
}

export const getTxHistory = () => {
    const history = localStorage.getItem('txHistory')
    return JSON.parse(history || '[]') as TxHistoryItem[]
}

export const getTxHistoryItem = (tx: string) => {
    return getTxHistory().find(x => x.swapTx === tx)
}

export const getMostRecentTxHistoryItem = () => {
    return getTxHistory().reverse()[0]
}

export const putHistory = (data: Omit<TxHistoryItem, 'date'>) => {
    console.log(data)

    const history = getTxHistory()
    history.push({ ...data, date: Date.now() })

    localStorage.setItem('txHistory', JSON.stringify(history))
    return history
}

export const updateHistory = (
    tx: string,
    status: TxStatus,
    hash?: string,
    bridgeStatus?: TxHistoryItem['bridgeToTokenInfo']
) => {
    const history = getTxHistory()

    const updatedHistory = history.map(item => {
        if (item.swapTx !== tx) {
            return item
        }

        item.finalStatus = status
        item.finalDstHash = hash
        item.bridgeToTokenInfo = bridgeStatus
        return item
    })

    localStorage.setItem('txHistory', JSON.stringify(updatedHistory))
    return updatedHistory
}

const getBridgeTransferTokenStatus = async (
    address: string,
    swap: TxHistoryItem
) => {
    if (swap.bridgeToTokenInfo) {
        return swap.bridgeToTokenInfo
    }

    // Find a transfer function to the target address
    const chain = chainsInfo[swap.toChain].bitqueryChainName
    const response = await fetch(
        `${process.env
            .NEXT_PUBLIC_BACKEND_ENDPOINT!}/getBridgeTxInfo/${address}/${chain}/${
            swap.finalDstHash
        }`
    )
    const bridgeTxStatus = await response.json()

    // Update the swap record
    const status = {
        status:
            bridgeTxStatus?.info?.currency.symbol !== swap.toSymbol
                ? 'failed'
                : 'success',
        toAddress: address,
        toAmount: bridgeTxStatus?.info?.amount,
        toSymbol: bridgeTxStatus?.info?.currency.symbol,
        toTokenAddress: bridgeTxStatus?.info?.currency.address,
    }

    return status as TxHistoryItem['bridgeToTokenInfo']
}

const checkBridgeTransferTokenSuccess = async (
    address: string | undefined,
    swap: TxHistoryItem
): Promise<any> => {
    if (
        swap.finalStatus !== TX_STATUS.SUCCESS ||
        !address ||
        !swap.finalDstHash
    ) {
        return
    }

    const status = await getBridgeTransferTokenStatus(address, swap)

    if (!status?.toSymbol) {
        await new Promise(resolve => setTimeout(resolve, 60000))
        return checkBridgeTransferTokenSuccess(address, swap)
    }

    return status
}

export const checkBridgeStatus = async (
    address: string | undefined,
    swapTx: string,
    setStatus: Function
) => {
    const swap = getTxHistoryItem(swapTx)

    if (!swap) {
        return
    }

    if (swap.finalStatus && swap.finalStatus !== TX_STATUS.PENDING) {
        return setStatus({
            status: swap.finalStatus,
            hash: swap.finalDstHash || null,
            bridgeStatus: swap.bridgeToTokenInfo,
        })
    }

    const sdk = await getSDK()
    try {
        const _status = await sdk.crossChainStatusManager.getCrossChainStatus(
            {
                fromBlockchain: chainsInfo[swap.fromChain].rubicSdkChainName,
                toBlockchain: chainsInfo[swap.toChain].rubicSdkChainName,
                txTimestamp: swap.date,
                srcTxHash: swap.swapTx,

                changenowId:
                    swap.bridge === 'changenow' ? swap.bridgeId : undefined,
                lifiBridgeType:
                    swap.bridge === 'lifi' ? swap.bridgeType : undefined,
                viaUuid: swap.bridge === 'via' ? swap.bridgeId : undefined,
                celerTransactionId:
                    swap.bridge === 'celer' ? swap.bridgeId : undefined,
                rangoRequestId:
                    swap.bridge === 'rango' ? swap.bridgeId : undefined,
            },
            swap.bridge! as CrossChainTradeType
        )

        setStatus({
            status: _status.dstTxStatus,
            hash: _status.dstTxHash,
        })

        const bridgeStatus = await checkBridgeTransferTokenSuccess(address, {
            ...swap,
            finalDstHash: _status.dstTxHash!,
            finalStatus: _status.dstTxStatus,
        })

        setStatus({
            status: _status.dstTxStatus,
            hash: _status.dstTxHash,
            bridgeStatus,
        })

        updateHistory(
            swap.swapTx,
            _status.dstTxStatus,
            _status.dstTxHash || undefined,
            bridgeStatus
        )

        if (_status.dstTxStatus === TX_STATUS.PENDING) {
            await new Promise(resolve => setTimeout(resolve, 10000))
            checkBridgeStatus(address, swapTx, setStatus)
        }
    } catch (e) {
        setStatus({
            status: TX_STATUS.FAIL,
            hash: '',
        })
    }
}
