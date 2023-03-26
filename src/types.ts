export enum SwapSide {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
}

export type Token = {
    network: string;
    address: string;
    coingeckoId?: string;
    name: string;
    symbol: string;
    image?: string;
    price?: string;
}

export type SearchResult = {
    address: string;
    name: string;
    symbol: string;
    blockchainNetwork: string;
    decimals: number
    image: string;
    rank: number;
    usedInIframe: boolean;
    coingeckoId?: string;
    usdPrice?: string,
    token_security: null
};

export const rubicNetworkToBitqueryNetwork = {
    avalanche: 'avalanche',
    ethereum: 'ethereum',
    'binance-smart-chain': 'bsc',
}
