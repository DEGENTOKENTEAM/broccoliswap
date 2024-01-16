import { chainFromChainId } from "@/helpers/chain";
import { useAccount, useContractWrite } from "wagmi";

import celerAbi from '../abi/celerVault.json';
import celerPeggedTokenAbi from '../abi/celerPeggedToken.json';
import { useState } from "react";

export default function useBridgeSend(
    type: 'mint' | 'burn',
    contractAddress: `0x${string}`,
    srcTokenAddress: string,
    inputAmount: string,
    dstChainId: number,
) {
    const [txNonce] = useState(Date.now());

    const { address } = useAccount();
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: contractAddress,
        abi: type === 'mint' ? celerAbi : celerPeggedTokenAbi,
        functionName: type === 'mint' ? 'deposit' : 'burn',
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