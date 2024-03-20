import { Token, chainsInfo } from "@/types";

export function guardEVM(token: Token) {
    if (token.type !== 'evm') {
        throw new Error('Token is not EVM');
    }

    return token;
};
