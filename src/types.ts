export enum Chain {
    ETH = 'ETH',
    BSC = 'BSC',
    AVAX = 'AVAX',
}

export type RubicToken = {
    address: string;
    name: string;
    symbol: string;
    blockchainNetwork: string;
    decimals: number;
    image: string;
    rank: number;
    usedInIframe: boolean;
    coingeckoId: string;
    usdPrice: string;
    token_security?: {
        has_info: boolean,
        trust_list: unknown,
        risky_security_items: number,
        attention_security_items: number,
        is_airdrop_scam: unknown,
        fake_token: boolean
    }
}

export const chainsInfo = {
    [Chain.ETH]: {
        id: 1,
        name: 'Ethereum',
        symbol: 'eth',
        logo: 'eth.svg',
        rubicName: 'ethereum',
    },
    [Chain.BSC]: {
        id: 56,
        name: 'Binance Smart Chain',
        symbol: 'bsc',
        logo: 'bnb.svg',
        rubicName: 'binance-smart-chain',
    },
    [Chain.AVAX]: {
        id: 43114,
        name: 'Avalanche',
        symbol: 'avax',
        logo: 'avalanche.svg',
        rubicName: 'avalanche',
    },
}