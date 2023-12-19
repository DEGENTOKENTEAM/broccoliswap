import { chainFromChainId } from "@/helpers/chain";
import { useAccount, useContractWrite } from "wagmi";

import celerAbi from '../abi/celerBridge.json';

export default function useBridgeSend(
    srcChainId: number,
    srcTokenAddress: string,
    inputAmount: string,
    dstChainId: number,
    slippage: string
) {
    const { address } = useAccount();
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: chainFromChainId(srcChainId)!.celerBridgeAddress,
        abi: celerAbi,
        functionName: 'send',
        args: [
            address,
            srcTokenAddress,
            inputAmount,
            dstChainId,
            Date.now(),
            slippage
        ]
    })

    return { data, isLoading, isSuccess, write };
}