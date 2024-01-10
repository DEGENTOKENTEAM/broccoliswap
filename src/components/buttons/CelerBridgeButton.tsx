import { bridgeConfigs, putHistory } from "@/helpers/celer";
import Button from "./Button";
import BigNumber from "bignumber.js";

import { useNetwork, useWaitForTransaction } from "wagmi";
import { chainFromChainId } from "@/helpers/chain";
import useGetAllowance from "@/hooks/useGetAllowance";
import useBridgeSend from "@/hooks/useBridgeSend";
import useWriteAllowance from "@/hooks/useWriteAllowance";
import { useState } from "react";
import { SwitchNetworkButton } from "./SwapButton";
import { ImCross } from "react-icons/im";
import { GoLinkExternal } from "react-icons/go";
import Link from "next/link";
import useCelerBridgeCap from "@/hooks/useCelerBridgeCap";

type BridgeButtonProps = { result: 'error', error: string } | {
    result: 'success',
    bridgeConfig: typeof bridgeConfigs[number];
    estimation: {
        estimatedReceiveAmount: BigNumber
        inputAmount: string,
        slippage: string,
    }
}

const BridgeSuccessBlock = (props: {
    result: Extract<BridgeButtonProps, { result: 'success' }>,
    bridgeTx: string,
    setShowRecentTrades?: Function,
}) => {
    const [show, setShow] = useState(true);

    if (!show) {
        return null;
    }

    return (
        <div className="bg-dark border-2 border-success p-3 rounded-xl text-light-200 my-3">
            <div className="flex mb-3 items-center justify-center">
                <div className="flex-grow">
                    Bridge successful!
                </div>
                <ImCross
                    className="cursor-pointer hover:text-activeblue transition-colors"
                    onClick={() => setShow(false)}
                />
            </div>
            <Link
                target="_blank"
                href={`https://celerscan.com/tx/${props.bridgeTx}`}
                className="hover:underline bg-broccoli p-3 rounded-xl text-white mt-2 cursor-pointer border-success border-2 hover:bg-success font-bold transition-colors block text-center"
            >
                View on explorer{' '}
                <GoLinkExternal className="inline" />
            </Link>

            <div
                onClick={() =>
                    props.setShowRecentTrades?.(true)
                }
                className="hover:underline bg-broccoli p-3 rounded-xl text-white mt-2 cursor-pointer border-success border-2 hover:bg-success font-bold transition-colors block text-center"
            >
                View Bridge Status
            </div>
            <p className="max-w-sm text-xs mt-3">Please note it can take between 5 and 30 minutes for your funds to arrive in the target chain.</p>
        </div>
    )
}

const BridgeButtonStepBridge = (props: {
    result: Extract<BridgeButtonProps, { result: 'success' }>,
    setShowRecentTrades?: Function
}) => {
    const { data, isLoading, isSuccess, write, address, txNonce } = useBridgeSend(
        props.result.bridgeConfig.org_chain_id,
        props.result.bridgeConfig.org_token.token.address,
        props.result.estimation.inputAmount,
        props.result.bridgeConfig.pegged_chain_id,
        props.result.estimation.slippage
    );
    const bridged = useWaitForTransaction({
        chainId: props.result.bridgeConfig.org_chain_id,
        hash: data?.hash,
    })

    if (isLoading || bridged.isLoading) {
        return (
            <Button disabled animating>Bridging...</Button>
        )
    } else if (isSuccess && data?.hash && address && bridged.isSuccess) {
        // Put history
        putHistory({
            hash: data.hash,
            bridgeConfig: props.result.bridgeConfig,
            estimation: props.result.estimation,
            walletAddress: address,
            nonce: txNonce,
        })

        return <BridgeSuccessBlock
            result={props.result}
            bridgeTx={data.hash}
            setShowRecentTrades={props.setShowRecentTrades}
        />
    } 

    return (
        <Button active onClick={() => write()}>Bridge</Button>
    )
}

const BridgeButtonStepApprove = (props: {
    result: Extract<BridgeButtonProps, { result: 'success' }>,
    setShowRecentTrades?: Function
}) => {
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
        <BridgeButtonStepBridge result={props.result} setShowRecentTrades={props.setShowRecentTrades} />
    )
}

export default function MainBridgeButton (props: { result: BridgeButtonProps; setShowRecentTrades?: Function }) {
    const { chain } = useNetwork();

    // Check bridge cap
    const { data } = useCelerBridgeCap();

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

    if (data && data.cap - data.total - BigInt(props.result.estimation.inputAmount) < 0) {
        return (
            <Button
                disabled
                infoMessage="The bridge cap has been reached. You cannot bridge more DGNX this route"
                infoMessageBorderColor="border-error">
                Bridge cap error
            </Button>
        )
    }

    if (chain?.id !== props.result.bridgeConfig.org_chain_id) {
        return <SwitchNetworkButton targetChainId={props.result.bridgeConfig.org_chain_id} />
    }

    return <BridgeButtonStepApprove result={props.result} setShowRecentTrades={props.setShowRecentTrades} />
}