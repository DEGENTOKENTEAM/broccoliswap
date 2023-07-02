import { Chain, chainsInfo } from "@/types";

export const searchToken = async (network: Chain, filter?: string) => {
    const result = await fetch(
        `https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=10${filter ? `&symbol=${filter}` : ''}`
    );
    const data = await result.json();

    return data.results;
}