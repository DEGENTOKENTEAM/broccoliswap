import { BLOCKCHAIN_NAME } from "rubic-sdk";

export enum Chain {
    ETH = 'ETH',
    BSC = 'BSC',
    AVAX = 'AVAX',
    ARBITRUM = 'ARBITRUM',
    POLYGON = 'POLYGON',
    FANTOM = 'FANTOM',
    BASE = 'BASE',
}

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export const rubicRPCEndpoints = {
    [BLOCKCHAIN_NAME.BINANCE_SMART_CHAIN]: {
        rpcList: ['https://bsc-dataseed.binance.org/']
    },
    [BLOCKCHAIN_NAME.ETHEREUM]: {
        rpcList: ['https://ethereum.publicnode.com', 'https://eth.llamarpc.com']
    },
    [BLOCKCHAIN_NAME.AVALANCHE]: {
        rpcList: ['https://avalanche-c-chain.publicnode.com']
    },
    [BLOCKCHAIN_NAME.ARBITRUM]: {
        rpcList: ['https://arb1.arbitrum.io/rpc']
    },
    [BLOCKCHAIN_NAME.POLYGON]: {
        rpcList: ['https://1rpc.io/matic']
    },
    [BLOCKCHAIN_NAME.FANTOM]: {
        rpcList: ['https://rpc.ftm.tools']
    },
    [BLOCKCHAIN_NAME.BASE]: {
        rpcList: ['https://base.gateway.tenderly.co']
    }
}

export type RubicToken = {
    type: 'evm';
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

export type SolanaTokenInfo = {
    type: 'solana';
    address: string;
    chainId: number;
    decimals: number;
    name: number;
    symbol: string;
    logoURI: string;
    tags: string[];
    extensions?: {
        coingeckoId?: string;
    };
}

export type Token = {
    type: 'evm';
    chain: Chain;
    token: RubicToken;
} | {
    type: 'solana';
    chain: 'solana';
    token: SolanaTokenInfo;
}

export type EVMToken = Extract<Token, { type: 'evm' }>;
export type SolanaToken = Extract<Token, { type: 'solana' }>;

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
        rpc: 'https://ethereum.publicnode.com',
        nativeTokenSymbol: 'ETH',
        dextoolsChartWidgetChainName: 'ether',
        dextoolsSlug: 'ether',
        celerBridgeAddress: '0x7510792A3B1969F9307F3845CE88e39578f2bAE1' as const,
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
        nativeTokenSymbol: 'BNB',
        dextoolsChartWidgetChainName: 'bnb',
        dextoolsSlug: 'bsc',
        celerBridgeAddress: '0x11a0c9270D88C99e221360BCA50c2f6Fda44A980' as const,
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
        nativeTokenSymbol: 'AVAX',
        dextoolsChartWidgetChainName: 'avalanche',
        dextoolsSlug: 'avalanche',
        celerBridgeAddress: '0xb51541df05DE07be38dcfc4a80c05389A54502BB' as const,
    },
    [Chain.ARBITRUM]: {
        chain: Chain.ARBITRUM,
        id: 42161,
        name: 'Arbitrum',
        symbol: 'arb',
        logo: 'arbitrum.svg',
        rubicName: 'arbitrum',
        explorer: 'https://arbiscan.io/',
        rubicSdkChainName: BLOCKCHAIN_NAME.ARBITRUM,
        bitqueryChainName: 'arbitrum',
        honeyPotCheckerContract: '0x0aa2037E40a78A169B5214418D66377ab828cb23',
        honeyPotCheckerRouter: '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13',
        honeyPotCheckerAddress: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        rpc: 'https://arb1.arbitrum.io/rpc',
        nativeTokenSymbol: 'ETH',
        dextoolsChartWidgetChainName: 'arbitrum',
        dextoolsSlug: 'arbitrum',
        celerBridgeAddress: '0xEA4B1b0aa3C110c55f650d28159Ce4AD43a4a58b' as const,
    },
    [Chain.POLYGON]: {
        chain: Chain.POLYGON,
        id: 137,
        name: 'Polygon',
        symbol: 'matic',
        logo: 'polygon.svg',
        rubicName: 'polygon',
        explorer: 'https://polygonscan.com/',
        rubicSdkChainName: BLOCKCHAIN_NAME.POLYGON,
        bitqueryChainName: 'polygon',
        honeyPotCheckerContract: '0xc817b3a104B7d48e3B9C4fbfd624e5D5F03757e0',
        honeyPotCheckerRouter: '0xa5e0829caced8ffdd4de3c43696c57f7d7a678ff',
        honeyPotCheckerAddress: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
        rpc: 'https://1rpc.io/matic',
        nativeTokenSymbol: 'MATIC',
        dextoolsChartWidgetChainName: 'polygon',
        dextoolsSlug: 'polygon',
        celerBridgeAddress: '0x4C882ec256823eE773B25b414d36F92ef58a7c0C' as const,
    },
    [Chain.FANTOM]: {
        chain: Chain.FANTOM,
        id: 250,
        name: 'Fantom',
        symbol: 'ftm',
        logo: 'fantom.svg',
        rubicName: 'fantom',
        explorer: 'https://ftmscan.com/',
        rubicSdkChainName: BLOCKCHAIN_NAME.FANTOM,
        bitqueryChainName: 'fantom',
        honeyPotCheckerContract: '0x4208B737e8f3075fD2dCB9cE3358689452f98dCf',
        honeyPotCheckerRouter: '0xf491e7b69e4244ad4002bc14e878a34207e38c29',
        honeyPotCheckerAddress: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
        rpc: 'https://rpc.ftm.tools',
        nativeTokenSymbol: 'FTM',
        dextoolsChartWidgetChainName: 'fantom',
        dextoolsSlug: 'fantom',
        celerBridgeAddress: '0xnoaddress' as const,
    },
    [Chain.BASE]: {
        chain: Chain.BASE,
        id: 8453,
        name: 'Base',
        symbol: 'base',
        logo: 'base.svg',
        rubicName: 'base',
        explorer: 'https://basescan.org/',
        rubicSdkChainName: BLOCKCHAIN_NAME.BASE,
        bitqueryChainName: 'base',
        honeyPotCheckerContract: '',
        honeyPotCheckerRouter: '',
        honeyPotCheckerAddress: '',
        rpc: 'https://base.gateway.tenderly.co',
        nativeTokenSymbol: 'ETH',
        dextoolsChartWidgetChainName: 'base',
        dextoolsSlug: 'base',
        celerBridgeAddress: '0xnoaddress' as const,
    },
}

export const solanaChainInfo = {
    type: 'solana',
    name: 'Solana',
    symbol: 'sol',
    logo: 'solana.svg',
    rubicName: 'solana',
    explorer: 'https://solscan.io/',
    rubicSdkChainName: BLOCKCHAIN_NAME.SOLANA,
    bitqueryChainName: 'solana',
    rpc: 'https://mainnet.helius-rpc.com/?api-key=b6347ea3-e68f-4bea-88c7-e4d9daee0cef',
    nativeTokenSymbol: 'SOL',
    dextoolsChartWidgetChainName: 'solana',
    dextoolsSlug: 'solana',
};