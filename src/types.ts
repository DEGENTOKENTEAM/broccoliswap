export type Token = {
    network: string;
    address: string;
    coingeckoId?: string;
    name: string;
    symbol: string;
    image?: string;
}

export const rubicNetworkToBitqueryNetwork = {
    avalanche: 'avalanche',
    ethereum: 'ethereum',
    'binance-smart-chain': 'bsc',
}
