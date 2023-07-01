export enum Chain {
    ETH = 'ETH',
    BSC = 'BSC',
    AVAX = 'AVAX',
}

export const chainsInfo = {
    [Chain.ETH]: {
        id: 1,
        name: 'Ethereum',
        symbol: 'eth',
        logo: 'eth.svg',
    },
    [Chain.BSC]: {
        id: 56,
        name: 'Binance Smart Chain',
        symbol: 'bsc',
        logo: 'bnb.svg',
    },
    [Chain.AVAX]: {
        id: 43114,
        name: 'Avalanche',
        symbol: 'avax',
        logo: 'avalanche.svg',
    },
}