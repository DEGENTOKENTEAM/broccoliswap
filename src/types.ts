import { BLOCKCHAIN_NAME } from "rubic-sdk";

export enum Chain {
    ETH = 'ETH',
    BSC = 'BSC',
    AVAX = 'AVAX',
}

export const rubicRPCEndpoints = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        rpcList: ['https://bsc-dataseed.binance.org/']
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        rpcList: ['https://eth.llamarpc.com']
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        rpcList: ['https://avalanche-c-chain.publicnode.com']
    }
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

export type Token = {
    chain: Chain;
    token: RubicToken;
}

export const chainsInfo = {
    [Chain.ETH]: {
        id: 1,
        name: 'Ethereum',
        symbol: 'eth',
        logo: 'eth.svg',
        rubicName: 'ethereum',
        explorer: 'https://etherscan.io/',
        rubicSdkChainName: BLOCKCHAIN_NAME.ETHEREUM,
    },
    [Chain.BSC]: {
        id: 56,
        name: 'Binance Smart Chain',
        symbol: 'bsc',
        logo: 'bnb.svg',
        rubicName: 'binance-smart-chain',
        explorer: 'https://bscscan.com/',
        rubicSdkChainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
    },
    [Chain.AVAX]: {
        id: 43114,
        name: 'Avalanche',
        symbol: 'avax',
        logo: 'avalanche.svg',
        rubicName: 'avalanche',
        explorer: 'https://snowtrace.io/',
        rubicSdkChainName: BLOCKCHAIN_NAME.AVALANCHE,
    },
}