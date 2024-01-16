import { useAccount, useContractWrite } from "wagmi";
import erc20Abi from '../abi/erc20.json';

export default function useWriteAllowance(tokenAddress: `0x${string}`, senderAddress: `0x${string}`, amount?: string) {
    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "approve",
        args: [senderAddress, amount],
    });

    return { data, isLoading, isSuccess, write };
}