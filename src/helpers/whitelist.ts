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
        }
    },
    8453: {
        '0x532f27101965dd16442E59d40670FaF5eBB142E4' : {
            secure: true,
            searchInfo: {
                type: 'evm',
                image: 'https://basescan.org/token/images/brettbased_32.png',
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
