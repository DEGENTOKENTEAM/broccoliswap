import { Chain } from "@/types";
import { TxStatus } from "rubic-sdk";

export enum SwapType {
    ON_CHAIN = 'ON_CHAIN',
    CROSS_CHAIN = 'CROSS_CHAIN',
}

export type TxHistoryItem ={
    fromChain: Chain;
    toChain: Chain;
    swapTx: string;
    fromAddress: string;
    fromSymbol: string;
    fromLogo: string;
    toSymbol: string;
    toAddress: string;
    fromAmount: number;
    toAmount: number;
    toLogo: string;
    date: number;
    bridge?: string;
    bridgeId?: string;
    bridgeType?: string;

    finalStatus?: TxStatus;
    finalDstHash?: string;
}

export const getTxHistory = () => {
    const history = localStorage.getItem('txHistory');
    return JSON.parse(history || '[]') as TxHistoryItem[];
}

export const putHistory = (data: Omit<TxHistoryItem, 'date'>) => {
    console.log(data)

    const history = getTxHistory();
    history.push({ ...data, date: Date.now() })

    localStorage.setItem('txHistory', JSON.stringify(history));
    return history
}

export const updateHistory = (tx: string, status: TxStatus, hash?: string) => {
    const history = getTxHistory();

    const updatedHistory = history.map(item => {
        if (item.swapTx !== tx) {
            return item;
        }

        item.finalStatus = status;
        item.finalDstHash = hash;
        return item;
    })

    localStorage.setItem('txHistory', JSON.stringify(updatedHistory));
    return updatedHistory;
}
