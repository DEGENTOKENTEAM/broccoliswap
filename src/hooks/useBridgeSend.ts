import { chainFromChainId } from "@/helpers/chain";
import { useAccount, useContractWrite } from "wagmi";

import celerAbi from '../abi/celerVault.json';
import { useState } from "react";

export default function useBridgeSend(
    srcChainId: number,
    srcTokenAddress: string,
    inputAmount: string,
    dstChainId: number,
    slippage: string
) {
    const [txNonce] = useState(Date.now());

    const { address } = useAccount();
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: chainFromChainId(srcChainId)!.celerBridgeAddress,
        abi: celerAbi,
        functionName: 'deposit',
        args: [
            srcTokenAddress,
            inputAmount,
            dstChainId,
            address,
            txNonce,
            // slippage
        ]
    })

    return { data, isLoading, isSuccess, write, address, txNonce };
}