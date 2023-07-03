import { Chain, chainsInfo, rubicRPCEndpoints } from "@/types";
import { Configuration, SDK } from "rubic-sdk";

const config: Configuration = {
    rpcProviders: rubicRPCEndpoints,
};
const sdk = SDK.createSDK(config);

export const searchToken = async (network: Chain, filterTxt?: string) => {
    // if filter is an address, search on that instead
    let filter = '';
    if (filterTxt?.startsWith('0x') && filterTxt.length >= 32) {
        filter = `&address=${filterTxt}`
    } else if (filterTxt) {
        filter = `&symbol=${filterTxt}`
    }

    const result = await fetch(
        `https://tokens.rubic.exchange/api/v1/tokens?networks=${chainsInfo[network].rubicName}&pageSize=10${filter}`
    );
    const data = await result.json();

    return data.results;
}

export const getSDK = () => {
    return sdk;
}