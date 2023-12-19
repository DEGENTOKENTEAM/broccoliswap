import { bridgeConfigs } from "@/helpers/celer";
import Button from "./Button";
import BigNumber from "bignumber.js";

import { useNetwork, useWaitForTransaction } from "wagmi";
import { chainFromChainId } from "@/helpers/chain";
import useGetAllowance from "@/hooks/useGetAllowance";
import useBridgeSend from "@/hooks/useBridgeSend";
import useWriteAllowance from "@/hooks/useWriteAllowance";
import { useState } from "react";
import { SwitchNetworkButton } from "./SwapButton";

type BridgeButtonProps = { result: 'error', error: string } | {
    result: 'success',
    bridgeConfig: typeof bridgeConfigs[number];
    estimation: {
        estimatedReceiveAmount: BigNumber
        inputAmount: string,
        slippage: string,
    }
}

const BridgeButtonStepBridge = (props: { result: Extract<BridgeButtonProps, { result: 'success' }> }) => {
    const { data, isLoading, isSuccess, write } = useBridgeSend(
        props.result.bridgeConfig.org_chain_id,
        props.result.bridgeConfig.org_token.token.address,
        props.result.estimation.inputAmount,
        props.result.bridgeConfig.pegged_chain_id,
        props.result.estimation.slippage
    );

    if (isLoading) {
        return (
            <Button disabled animating>Bridging...</Button>
        )
    } else if (isSuccess) {
        console.log(data)
        return <p>Success!</p>
    } 

    return (
        <Button active onClick={() => write()}>Bridge</Button>
    )
}

const BridgeButtonStepApprove = (props: { result: Extract<BridgeButtonProps, { result: 'success' }> }) => {
    const [approveTx, setApproveTx] = useState('');

    const celerAddress = chainFromChainId(props.result.bridgeConfig.org_chain_id)!.celerBridgeAddress;
    const { data, write } = useWriteAllowance(
        props.result.bridgeConfig.org_token.token.address,
        celerAddress,
        props.result.estimation.inputAmount,
    );
    const { data: tx, isLoading: approveLoading } = useWaitForTransaction({
        hash: data?.hash,
    })
    const allowance = useGetAllowance(
        props.result.bridgeConfig.org_token.token.address,
        celerAddress
    );

    if (allowance.isLoading) {
        return (
            <Button disabled animating>Loading...</Button>
        )
    } else if (approveLoading) {
        return (
            <Button disabled animating>Approving...</Button>
        )
    } else if (BigNumber((allowance.data as bigint).toString()).lt(BigNumber(props.result.estimation.inputAmount))) {
        return <Button active onClick={() => write()}>Approve</Button>
    } 

    return (
        <BridgeButtonStepBridge result={props.result} />
    )
}

export default function MainBridgeButton (props: { result: BridgeButtonProps }) {
    const { chain } = useNetwork();

    if (props.result.result === 'error') {
        return (
            <Button
                disabled
                infoMessage={props.result.error}
                infoMessageBorderColor="border-error">
                Bridge estimation error
            </Button>
        )
    }

    if (chain?.id !== props.result.bridgeConfig.org_chain_id) {
        return <SwitchNetworkButton targetChainId={props.result.bridgeConfig.org_chain_id} />
    }

    return <BridgeButtonStepApprove result={props.result} />
}