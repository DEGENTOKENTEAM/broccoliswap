
export enum SwapSide {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
}

export type Token = {
    network: string;
    address: `0x${string}`;
    coingeckoId?: string;
    name: string;
    symbol: string;
    image?: string;
    price?: string;
}

export type SearchResult = {
    address: `0x${string}`;
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

export const rubicRPCEndpoints = {
    // [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
    //     rpcList: ['https://bsc-dataseed.binance.org/']
    // },
    // [BLOCKCHAIN_NAME.ETHEREUM]: {
    //     rpcList: ['https://eth.llamarpc.com']
    // },
    // [BLOCKCHAIN_NAME.AVALANCHE]: {
    //     rpcList: ['https://avalanche-c-chain.publicnode.com']
    // }
}

export const wagmiNetworkIdToRubicNetwork = {
    // 1: BLOCKCHAIN_NAME.ETHEREUM,
    // 56: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    // 43114: BLOCKCHAIN_NAME.AVALANCHE,
}

export const rubicNetworkToWagmiNetworkId = {
    // [BLOCKCHAIN_NAME.ETHEREUM]: 1,
    // [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 56,
    // [BLOCKCHAIN_NAME.AVALANCHE]: 43114,
}

export const rubicTokenNetworkToBlockchain = {
    // avalanche: BLOCKCHAIN_NAME.AVALANCHE,
    // ethereum: BLOCKCHAIN_NAME.ETHEREUM,
    // 'binance-smart-chain': BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
}

export const blockchainToRubicTokenNetwork = {
    // [BLOCKCHAIN_NAME.AVALANCHE]: 'avalanche',
    // [BLOCKCHAIN_NAME.ETHEREUM]: 'ethereum',
    // [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: 'binance-smart-chain',
}

export const rubicTokenNetworkToChainId = {
    avalanche: 43114,
    ethereum: 1,
    'binance-smart-chain': 56,
} as const
