import { Chain, Token, chainsInfo, solanaChainInfo } from '@/types'

export const chainFromChainId = (id?: number) => {
    if (!id) {
        return;
    }

    const chain = Object.values(chainsInfo).find(info => info.id === id)

    if (!chain) {
        throw Error('Could not find chain')
    }

    return chain
}

export const blockchainNameToChainID = (blockchain?: string) => {
    if (!blockchain) {
        return;
    }

    const chain = Object.values(chainsInfo).find(
        info => info.rubicSdkChainName === blockchain
    )

    if (!chain) {
        throw Error('Could not find chain')
    }

    return chain.id
}

export const blockchainNameToChain = (blockchain?: string) => {
    if (!blockchain) {
        return;
    }

    const chain = Object.values(chainsInfo).find(
        info => info.rubicSdkChainName === blockchain
    )

    if (!chain) {
        throw Error('Could not find chain')
    }

    return chain
}

export const getTokenLogo = (token: Token) => {
    if (token.type === 'solana') {
        return token.token.logoURI;
    }

    return token.token.image;
}

export const getChainLogo = (token: Token) => {
    if (token.type === 'solana') {
        return 'solana.svg';
    }

    return chainsInfo[token.chain].logo;
}

export const getDextoolsSlug = (token: Token) => {
    if (token.type === 'solana') {
        return solanaChainInfo.dextoolsSlug;
    }

    return chainsInfo[token.chain].dextoolsSlug;
}

