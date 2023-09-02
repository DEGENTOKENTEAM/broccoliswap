import { toPrecision } from "@/helpers/number";
import { NULL_ADDRESS } from "@/types";
import { useEffect } from "react";
import { useAccount, useBalance } from "wagmi";

export const BalanceAmount = (props: { tokenAddress?: string; chainId?: number; precision?: number; setInputBalance?: (balance: number) => void, refreshProp: number }) => {
    const { address } = useAccount();
    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token:
            props.tokenAddress !== NULL_ADDRESS
                ? props.tokenAddress as `0x${string}`
                : undefined,
        chainId: props.chainId
    });

    useEffect(() => {
        props.setInputBalance?.(parseFloat(balanceData?.formatted || '0'))
    }, [balanceData, props.setInputBalance])

    if (!address) {
        return null;
    }

    return (<div>
        {props.precision ? toPrecision(parseFloat(balanceData?.formatted || ''), props.precision) : balanceData?.formatted}
    </div>)
}