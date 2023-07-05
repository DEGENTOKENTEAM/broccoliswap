import { Chain } from "@/types";

export enum SwapType {
    ON_CHAIN = 'ON_CHAIN',
    CROSS_CHAIN = 'CROSS_CHAIN',
}

export type TxHistoryItem ={
    fromChain: Chain,
    toChain: Chain,
    swapTx: string,
    type: SwapType,
    fromAddress: string,
    fromSymbol: string,
    fromLogo: string;
    toSymbol: string,
    toAddress: string,
    fromAmount: number,
    toAmount: number,
    toLogo: string;
    date: number,
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
