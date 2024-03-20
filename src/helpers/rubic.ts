import { Chain, NULL_ADDRESS, RubicToken, chainsInfo, rubicRPCEndpoints } from "@/types";
import { fetchToken } from "wagmi/actions";
import { Configuration, SDK } from "rubic-sdk";
import { getTokenInfo } from "./coingecko";

const config: Configuration = {
    rpcProviders: rubicRPCEndpoints,
    providerAddress: {
        EVM: {
            crossChain: '0x000007eba76b61031826E9cF306EaC1b1B59eF5A',
            onChain: '0x000007eba76b61031826E9cF306EaC1b1B59eF5A',
        }
    }
};
const sdk = SDK.createSDK(config);

const searchTokenOnRubic = async (network: Chain, filterTxt?: string, noNative?: boolean): Promise<RubicToken[]> => {
    // if filter is an address, search on that instead
    let filter = '';
    if (filterTxt?.startsWith('0x') && filterTxt.length >= 32) {
        filter = `&address=${filterTxt}`
    } else if (filterTxt) {
        filter = `&symbol=${filterTxt}`
    }

    // Add DGNX first if avax
    if ((network === Chain.AVAX || network === Chain.ETH) && !filterTxt) {
        const results = await Promise.all([
            fetch(`https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=1&symbol=dgnx`),
            fetch(`https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=9${filter}`),
        ])
        const dgnx = await results[0].json();

        // Override token logo because it doesn't exist yet on ETH
        dgnx.results[0].image = 'https://assets.rubic.exchange/assets/avalanche/0x51e48670098173025c477d9aa3f0eff7bf9f7812/logo.png';

        const rest = await results[1].json();
        let data = [...dgnx.results, ...rest.results]
        if (noNative) {
            data = data.filter((x: any) => x.address !== NULL_ADDRESS);
        }
        return data;
    }

    const result = await fetch(
        `https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=10${filter}`
    );
    let data = await result.json();

    if (noNative) {
        data.results = data.results.filter((x: any) => x.address !== NULL_ADDRESS);
    }

    // If this is ETH or ARB and there is no filterTxt, Rubic comes up first, that's annoying
    if ([Chain.ETH, Chain.ARBITRUM].includes(network) && !filterTxt) {
        return data.results.slice(1)
    }

    // If there are no results and the input is an address, try direct import
    if (data.results.length === 0 && filterTxt?.startsWith('0x')) {
        const token = await fetchToken({
            address: filterTxt as `0x${string}`,
            chainId: chainsInfo[network].id
        })

        if (token) {
            return [{
                type: 'evm',
                address: filterTxt,
                name: token.name,
                symbol: token.symbol,
                blockchainNetwork: chainsInfo[network].rubicSdkChainName,
                decimals: token.decimals,
                usdPrice: '0',
            }]
        }
    }

    return data.results;
}

export const searchToken = async (network: Chain, filterTxt?: string, noNative?: boolean) => {
    const tokens = await searchTokenOnRubic(network, filterTxt, noNative);

    // Find images and append coingecko ones
    await Promise.all(tokens.map(async (token) => {
        if (token.image) {
            return token;
        }

        if (token.coingeckoId) {
            const coingeckoData = await getTokenInfo(token.coingeckoId);
            token.image = coingeckoData.image.thumb;
            return token;
        }

        return token;
    }));

    return tokens;
}

export const getSDK = () => {
    return sdk;
}