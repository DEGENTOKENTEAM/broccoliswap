import { chainsInfo } from "@/types";

export const chainIdToBlockchainName = (id?: number) => {
    const chain = Object.values(chainsInfo).find(info => info.id === id);

    if (!chain) {
        throw Error("Could not find chain");
    }

    return chain.rubicSdkChainName;
};

export const blockchainNameToChainID = (blockchain?: string) => {
    const chain = Object.values(chainsInfo).find(
        info => info.rubicSdkChainName === blockchain
    );

    if (!chain) {
        throw Error("Could not find chain");
    }

    return chain.id;
};

export const blockchainNameToChain = (blockchain?: string) => {
    const chain = Object.values(chainsInfo).find(
        info => info.rubicSdkChainName === blockchain
    );

    if (!chain) {
        throw Error("Could not find chain");
    }

    return chain;
};