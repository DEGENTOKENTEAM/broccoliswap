export type GoPlusTokenReponse = {
    buy_tax: number;
    sell_tax: number;
}

const cache: Record<string, GoPlusTokenReponse> = {}

export const getTokenSecurity = async (chainId: number, tokenAddress: string): Promise<GoPlusTokenReponse> => {
    if (cache[`${chainId}-${tokenAddress}`]) {
        return cache[`${chainId}-${tokenAddress}`];
    }

    const response = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${tokenAddress}`)
    const { result }= await response.json();
    const tokenInfo = result[tokenAddress]
    
    cache[`${chainId}-${tokenAddress}`] = {
        buy_tax: 100 * parseFloat(tokenInfo?.buy_tax || '0'),
        sell_tax: 100 * parseFloat(tokenInfo?.sell_tax || '0'),
    }

    return cache[`${chainId}-${tokenAddress}`];
}
