import { useAccount, useContractRead } from "wagmi";
import { useReducer } from "react";

const abi = [
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_bridge",
                "type": "address"
            }
        ],
        "name": "bridges",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "cap",
                        "type": "uint256"
                    },
                    {
                        "internalType": "uint256",
                        "name": "total",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct ERC20Facet.BridgeSupply",
                "name": "_supply",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

/**
 * Currently only supports ETH bridge cap.
 * 
 * Adjust function when new bridges are added
 */
export default function useCelerBridgeCap() {
    const { data, isError, isLoading } = useContractRead({
        chainId: 1,
        address: '0x0000000000300dd8B0230efcfEf136eCdF6ABCDE',
        abi,
        functionName: 'bridges',
        args: ['0x52E4f244f380f8fA51816c8a10A63105dd4De084'],
    })

    return { isLoading, isError, data } as {
        isLoading: boolean;
        isError: boolean;
        data: { cap: bigint, total: bigint };
    };
}
