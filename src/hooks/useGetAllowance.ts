import { useAccount, useContractRead } from "wagmi";
import erc20Abi from '../abi/erc20.json';
import { useReducer } from "react";

export default function useGetAllowance(tokenAddress: `0x${string}`, spenderAddress: `0x${string}`) {
    const { address } = useAccount();
    const [_, forceUpdate] = useReducer((x) => x + 1, 0);
    const { data, isError, isLoading } = useContractRead({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'allowance',
        args: [address, spenderAddress],
        watch: true,
    })

    return { isLoading, isError, data, forceUpdate };
}
