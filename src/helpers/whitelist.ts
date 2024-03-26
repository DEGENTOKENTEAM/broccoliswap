import { RubicToken } from "@/types";

type Whitelist = {
    secure: boolean;
    searchInfo?: RubicToken
}

export const whitelistedTokens: Record<number, Record<string, Whitelist>> = {
    1: {
        '0x0000000000300dd8b0230efcfef136ecdf6abcde': {
            secure: true,
        }
    },
    43114: {
        '0x51e48670098173025c477d9aa3f0eff7bf9f7812': {
            secure: true,
        },
        '0xEbB5d4959B2FbA6318FbDa7d03cd44aE771fc999': {
            secure: true,
            searchInfo: {
                type: 'evm',
                image: 'https://dd.dexscreener.com/ds-data/tokens/avalanche/0xebb5d4959b2fba6318fbda7d03cd44ae771fc999.png',
                address: '0xEbB5d4959B2FbA6318FbDa7d03cd44aE771fc999',
                name: 'KONG',
                symbol: 'KONG',
                blockchainNetwork: 'avalanche',
                decimals: 18,
                usdPrice: '0',
            }
        }
    },
    8453: {
        '0x532f27101965dd16442E59d40670FaF5eBB142E4' : {
            secure: true,
            searchInfo: {
                type: 'evm',
                image: 'https://assets.coingecko.com/coins/images/35529/standard/1000050750.png',
                address: '0x532f27101965dd16442E59d40670FaF5eBB142E4',
                name: 'BRETT',
                symbol: 'BRETT',
                blockchainNetwork: 'base',
                decimals: 18,
                usdPrice: '0',
            }
        }
    }
};
