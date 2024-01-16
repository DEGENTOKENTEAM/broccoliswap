import moment from "moment";
import { classNames } from "@/helpers/classNames";
import { fromIntString, toPrecision } from "@/helpers/number";
import { getTxHistory } from "@/helpers/txHistory";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import useDisableScroll from "@/hooks/useDisableScroll";
import { SwapHistoryItem } from "./SwapHistory/HistoryItem";
import { SubHeader } from "./SubHeader";
import { BridgeHistoryItem, BridgeStatus, getBridgeHistory, getTransferStatus } from "@/helpers/celer";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import Link from "next/link";
import { GoArrowRight, GoLinkExternal } from "react-icons/go";
import { IoMdRefresh } from "react-icons/io";
import { TokenAmount } from "./SwapHistory/TokenAmount";
import { chainFromChainId } from "@/helpers/chain";
import useCelerRefund from "@/hooks/useCelerRefund";

const CelerRefundButton = (props: { item: BridgeHistoryItem }) => {
    const { isLoading, isSuccess, write } = useCelerRefund(props.item);

    if (isLoading) {
        return <p>Refund initiated.</p>;
    }

    if (isSuccess) {
        return <p>Refund initiated. The status will be updated soon. Please wait a couple of minutes before trying again.</p>;
    }

    return (
        <button onClick={() => write()} className="bg-darkblue transition-colors border-2 border-activeblue hover:bg-activeblue px-3 py-2 rounded-xl">
            Refund
        </button>
    )
}
        
const CelerBridgeStatus = (props: { status?: BridgeStatus }) => {
    if (!props.status || props.status === BridgeStatus.TRANSFER_UNKNOWN) {
        return <div className="flex gap-1 px-2 items-center">Pending... <IoMdRefresh className="animate-spin" /></div>;
    }

    if ([
        BridgeStatus.TRANSFER_SUBMITTING,
        BridgeStatus.TRANSFER_WAITING_FOR_SGN_CONFIRMATION,
        BridgeStatus.TRANSFER_WAITING_FOR_FUND_RELEASE,
        BridgeStatus.TRANSFER_REQUESTING_REFUND,
        BridgeStatus.TRANSFER_CONFIRMING_YOUR_REFUND,
        BridgeStatus.TRANSFER_DELAYED,
    ].includes(props.status)) {
        return <div className="flex gap-1 px-2 items-center">Bridging... <IoMdRefresh className="animate-spin" /></div>;
    }

    if ([
        BridgeStatus.TRANSFER_FAILED,
        BridgeStatus.TRANSFER_TO_BE_REFUNDED,
        BridgeStatus.TRANSFER_REFUND_TO_BE_CONFIRMED,
    ].includes(props.status)) {
        return <div className="flex gap-1 px-2 items-center">Failed</div>;
    }

    if ([
        BridgeStatus.TRANSFER_REFUNDED,
    ].includes(props.status)) {
        return <div className="flex gap-1 px-2 items-center">Refunded</div>;
    }

    if ([
        BridgeStatus.TRANSFER_COMPLETED,
    ].includes(props.status)) {
        return <div className="flex gap-1 px-2 items-center">Completed</div>;
    }

    return null;
}

const BridgeHistoryRecord = (props: { bridge: BridgeHistoryItem }) => {
    const [status, setStatus] = useState<BridgeStatus>();

    const recurringCheckStatus = async () => {
        const _status = await getTransferStatus(props.bridge)
        if (!_status?.status) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            recurringCheckStatus();
        }

        if (![
            BridgeStatus.TRANSFER_COMPLETED,
            BridgeStatus.TRANSFER_FAILED,
            BridgeStatus.TRANSFER_REFUNDED,
        ].includes(_status.status!)) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            recurringCheckStatus();
        }

        setStatus(_status.status);
    }

    useEffect(() => {
        recurringCheckStatus();
    }, []);

    return (
        <>
            <div className="col-span-12 sm:col-span-6 flex items-start sm:items-center mt-5 flex-col sm:flex-row gap-1">
                <div>Date:</div>
                <div>
                    {moment
                        .unix(props.bridge.date / 1000)
                        .format("YYYY-MM-DD HH:mm:ss")}
                </div>
            </div>
            <div className="flex w-full items-center justify-start sm:justify-end col-span-12 sm:col-span-6 sm:mt-5">
                <Link
                    className="flex gap-1 items-center sm:px-2 py-1 rounded-xl hover:underline"
                    target="_blank"
                    href={`https://celerscan.com/tx/${props.bridge.hash}`}
                >
                    View
                    <GoLinkExternal />
                </Link>
                <CelerBridgeStatus
                    status={status}
                />
            </div>
            <div className="col-span-5">
                <TokenAmount
                    address={props.bridge.bridgeConfig.org_token.token.address}
                    logo={props.bridge.bridgeConfig.org_token.icon}
                    chain={chainFromChainId(props.bridge.bridgeConfig.org_chain_id)!.chain}
                    symbol={props.bridge.bridgeConfig.org_token.token.symbol}
                    amount={fromIntString(props.bridge.estimation.inputAmount, props.bridge.bridgeConfig.org_token.token.decimal)}
                />
            </div>
            <div className="flex justify-center items-center col-span-2">
                <GoArrowRight />
            </div>
            <div className="col-span-5">
                <TokenAmount
                    address={props.bridge.bridgeConfig.pegged_token.token.address}
                    logo={props.bridge.bridgeConfig.pegged_token.icon}
                    chain={chainFromChainId(props.bridge.bridgeConfig.pegged_chain_id)!.chain}
                    symbol={props.bridge.bridgeConfig.pegged_token.token.symbol}
                    amount={fromIntString(props.bridge.estimation.estimatedReceiveAmount, props.bridge.bridgeConfig.org_token.token.decimal)}
                />
            </div>
            {status && [
                BridgeStatus.TRANSFER_TO_BE_REFUNDED,
                BridgeStatus.TRANSFER_REFUND_TO_BE_CONFIRMED,
            ].includes(status) && (
                <div className="flex flex-col w-full items-start justify-start col-span-12 mt-2 sm:mt-5 bg-dark border-2 border-warning p-3 rounded-xl text-light-100 font-bold">
                    The bridge did not complete successfully, please click the button below to initiate a refund
                    <div className="flex items-center gap-2 mt-2">
                        <CelerRefundButton item={props.bridge} />
                    </div>
                </div>
            )}
        </>
    );
}

export const SwapHistory = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));
    useDisableScroll(props.show);

    const recentTrades = getTxHistory();
    const recentCelerBridges = getBridgeHistory();

    const allTrades = useMemo(() => {
        return [
            ...recentTrades,
            ...recentCelerBridges
        ].sort((a, b) => a.date > b.date ? 1 : -1);
    }, [recentTrades, recentCelerBridges]);

    return (
        <div
            className={classNames(
                "fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity ease-in z-10",
                props.show ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div
                ref={divRef}
                className="max-w-2xl w-full m-5 bg-darkblue border-2 border-activeblue p-5 rounded-xl relative z-20"
            >
                <div className="flex text-white mb-3 items-center justify-center">
                    <SubHeader className="flex-grow">Swap History</SubHeader>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-activeblue transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                <div className="w-full grid grid-cols-12 pr-3 gap-1 max-h-[calc(80vh-200px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-activeblue">
                    {allTrades.reverse().map(trade => {
                        if (trade.type === 'celerBridge') {
                            return <BridgeHistoryRecord key={trade.hash} bridge={trade} />
                        }

                        return (
                            <SwapHistoryItem
                                swapTx={trade.swapTx}
                                key={trade.swapTx}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
