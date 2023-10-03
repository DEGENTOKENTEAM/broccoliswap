import { BLOCKCHAIN_NAME } from "rubic-sdk";

export enum Chain {
    ETH = 'ETH',
    BSC = 'BSC',
    AVAX = 'AVAX',
}

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

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
    image?: string;
    rank?: number;
    usedInIframe?: boolean;
    coingeckoId?: string;
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
        chain: Chain.ETH,
        id: 1,
        name: 'Ethereum',
        symbol: 'eth',
        logo: 'eth.svg',
        rubicName: 'ethereum',
        explorer: 'https://etherscan.io/',
        rubicSdkChainName: BLOCKCHAIN_NAME.ETHEREUM,
        bitqueryChainName: 'ethereum',
        honeyPotCheckerContract: '0xe7e07a2281f1e66e938ae7feefc69db181329f12',
        honeyPotCheckerRouter: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        honeyPotCheckerAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        rpc: 'https://eth.llamarpc.com',
        nativeTokenSymbol: 'ETH'
    },
    [Chain.BSC]: {
        chain: Chain.BSC,
        id: 56,
        name: 'Binance Smart Chain',
        symbol: 'bsc',
        logo: 'bnb.svg',
        rubicName: 'binance-smart-chain',
        explorer: 'https://bscscan.com/',
        rubicSdkChainName: BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN,
        bitqueryChainName: 'bsc',
        honeyPotCheckerContract: '0x385826FBd70DfBB0a7188eE790A36E1fe4f6fc34',
        honeyPotCheckerRouter: '0x10ed43c718714eb63d5aa57b78b54704e256024e',
        honeyPotCheckerAddress: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        rpc: 'https://bsc-dataseed.binance.org/',
        nativeTokenSymbol: 'BNB'
    },
    [Chain.AVAX]: {
        chain: Chain.AVAX,
        id: 43114,
        name: 'Avalanche',
        symbol: 'avax',
        logo: 'avalanche.svg',
        rubicName: 'avalanche',
        explorer: 'https://snowtrace.io/',
        rubicSdkChainName: BLOCKCHAIN_NAME.AVALANCHE,
        bitqueryChainName: 'avalanche',
        honeyPotCheckerContract: '0x2B30ddE904B22c0Bba6019543231c857e0Be1DfB',
        honeyPotCheckerRouter: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
        honeyPotCheckerAddress: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
        rpc: 'https://avalanche-c-chain.publicnode.com',
        nativeTokenSymbol: 'AVAX'
    },
}