import { Chain, NULL_ADDRESS, chainsInfo, rubicRPCEndpoints } from "@/types";
import { fetchToken } from "wagmi/actions";
import { Configuration, SDK } from "rubic-sdk";

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

export const searchToken = async (network: Chain, filterTxt?: string, noNative?: boolean) => {
    // if filter is an address, search on that instead
    let filter = '';
    if (filterTxt?.startsWith('0x') && filterTxt.length >= 32) {
        filter = `&address=${filterTxt}`
    } else if (filterTxt) {
        filter = `&symbol=${filterTxt}`
    }

    // Add DGNX first if avax
    if (network === Chain.AVAX && !filterTxt) {
        const results = await Promise.all([
            fetch(`https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=1&symbol=dgnx`),
            fetch(`https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=9${filter}`),
        ])
        const dgnx = await results[0].json();
        const rest = await results[1].json();
        let data = [...dgnx.results, ...rest.results]
        if (noNative) {
            console.log(data)
            data = data.filter((x: any) => x.address !== NULL_ADDRESS);
        }
        return data;
    }

    const result = await fetch(
        `https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=10${filter}`
    );
    let data = await result.json();

    if (noNative) {
        console.log(data)
        data = data.filter((x: any) => x.address !== NULL_ADDRESS);
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
                address: filterTxt,
                name: token.name,
                symbol: token.symbol,
                blockchainNetwork: chainsInfo[network].rubicSdkChainName,
                decimals: token.decimals,
                usePrice: '0',
            }]
        }
    }

    return data.results;
}

export const getSDK = () => {
    return sdk;
}