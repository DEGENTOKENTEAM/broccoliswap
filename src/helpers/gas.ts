import { Chain, chainsInfo } from "@/types";
import { getSDK } from "./rubic";

export const getGas = async (chain: Chain) => {
    const sdk = await getSDK();
    const gas = await sdk.gasPriceApi.getGasPrice(chainsInfo[chain].rubicSdkChainName)
    
    return gas;
}