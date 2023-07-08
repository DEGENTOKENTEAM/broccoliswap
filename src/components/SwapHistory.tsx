import moment from "moment";
import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import {
    SwapType,
    TxHistoryItem,
    getTxHistory,
    updateHistory
} from "@/helpers/txHistory";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { GoArrowRight, GoLinkExternal } from "react-icons/go";
import Link from "next/link";
import { Chain, NULL_ADDRESS, chainsInfo } from "@/types";
import { TokenImage } from "./TokenImage";
import { RxCaretDown } from "react-icons/rx";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import {
    CrossChainStatus,
    CrossChainStatusManager,
    CrossChainTradeType,
    TxStatus
} from "rubic-sdk";
import { IoMdRefresh } from "react-icons/io";
import { getSDK } from "@/helpers/rubic";

const TokenAmount = (props: {
    address: string;
    logo: string;
    symbol: string;
    amount: number;
    chain: Chain;
}) => {
    return (
        <div className="bg-slate-600 relative rounded-xl flex items-center justify-center px-3 py-1 font-bold gap-1 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-1">
                <div className="relative">
                    <TokenImage
                        src={props.logo}
                        symbol={props.symbol}
                        size={24}
                    />

                    {props.address !== NULL_ADDRESS && (
                        <div className="absolute left-2 top-2">
                            <TokenImage
                                src={`/chains/${chainsInfo[props.chain].logo}`}
                                symbol={props.symbol}
                                size={14}
                            />
                        </div>
                    )}
                </div>
                <div>{toPrecision(props.amount, 4)}</div>
                <div className="flex items-end">{props.symbol}</div>
            </div>
        </div>
    );
};

const BridgeStatus = (props: { swap: TxHistoryItem }) => {
    const { swap } = props;
    const [status, setStatus] = useState<{
        status: TxStatus;
        hash: string | null;
    }>();

    const [forceRefreshVar, forceRefresh] = useState(0);

    useAsyncEffect(async () => {
        if (swap.finalStatus && swap.finalStatus !== TxStatus.PENDING) {
            return setStatus({
                status: swap.finalStatus,
                hash: swap.finalDstHash || null
            });
        }
        const sdk = await getSDK();
        try {
            const _status = await sdk.crossChainStatusManager.getCrossChainStatus(
                {
                    fromBlockchain:
                        chainsInfo[swap.fromChain].rubicSdkChainName,
                    toBlockchain: chainsInfo[swap.toChain].rubicSdkChainName,
                    txTimestamp: swap.date,
                    srcTxHash: swap.swapTx,

                    changenowId:
                        swap.bridge === "changenow" ? swap.bridgeId : undefined,
                    lifiBridgeType:
                        swap.bridge === "lifi" ? swap.bridgeType : undefined,
                    viaUuid: swap.bridge === "via" ? swap.bridgeId : undefined,
                    celerTransactionId:
                        swap.bridge === "celer" ? swap.bridgeId : undefined,
                    rangoRequestId:
                        swap.bridge === "rango" ? swap.bridgeId : undefined
                },
                swap.bridge! as CrossChainTradeType
            );

            setStatus({
                status: _status.dstTxStatus,
                hash: _status.dstTxHash
            });

            updateHistory(
                swap.swapTx,
                _status.dstTxStatus,
                _status.dstTxHash || undefined
            );

            if (_status.dstTxStatus === TxStatus.PENDING) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                forceRefresh(Math.random());
            }
        } catch (e) {
            setStatus({
                status: TxStatus.FAIL,
                hash: ""
            });
        }
    }, [forceRefreshVar]);
    if (status?.status === TxStatus.PENDING) {
        return (
            <div className="flex gap-1 items-center">
                Bridge pending
                <IoMdRefresh className="animate-spin" />
            </div>
        );
    }

    if (status?.status === TxStatus.SUCCESS) {
        return (
            <Link
                className="flex gap-1 items-center px-2 py-1 rounded-xl hover:underline"
                target="_blank"
                href={`${chainsInfo[swap.toChain].explorer}tx/${status.hash}`}
            >
                View dest tx
                <GoLinkExternal />
            </Link>
        );
    }

    return (
        <div className="flex gap-1 items-center px-2 py-1">Error bridging</div>
    );
};

const SwapHistoryItem = (props: { swap: TxHistoryItem }) => {
    const { swap } = props;

    return (
        <>
            <div className="col-span-12 sm:col-span-6 flex items-start sm:items-center mt-5 flex-col sm:flex-row gap-1">
                <div>Date:</div>
                <div>
                    {moment
                        .unix(swap.date / 1000)
                        .format("YYYY-MM-DD HH:mm:ss")}
                </div>
            </div>
            <div className="flex w-full items-center justify-start sm:justify-end col-span-12 sm:col-span-6 sm:mt-5">
                <Link
                    className="flex gap-1 items-center sm:px-2 py-1 rounded-xl hover:underline"
                    target="_blank"
                    href={`${chainsInfo[swap.fromChain].explorer}tx/${
                        swap.swapTx
                    }`}
                >
                    View {swap.bridge && "src tx"}
                    <GoLinkExternal />
                </Link>
                {swap.bridge && <BridgeStatus swap={swap} />}
            </div>
            <div className="col-span-5">
                <TokenAmount
                    address={swap.fromAddress}
                    logo={swap.fromLogo}
                    chain={swap.fromChain}
                    symbol={swap.fromSymbol}
                    amount={swap.fromAmount}
                />
            </div>
            <div className="flex justify-center items-center col-span-2">
                <GoArrowRight />
            </div>
            <div className="col-span-5">
                <TokenAmount
                    address={swap.toAddress}
                    logo={swap.toLogo}
                    chain={swap.toChain}
                    symbol={swap.toSymbol}
                    amount={swap.toAmount}
                />
            </div>
        </>
    );
};

export const SwapHistory = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));

    const recentTrades = getTxHistory();

    return (
        <div
            className={classNames(
                "absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity ease-in z-10",
                props.show ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div
                ref={divRef}
                className="max-w-2xl w-full m-5 bg-slate-700 p-5 rounded-xl relative z-20"
            >
                <div className="flex text-2xl text-white mb-3 items-center justify-center">
                    <h2 className="flex-grow">Swap History</h2>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-orange-600 transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                <div className="w-full grid grid-cols-12 gap-1 max-h-[calc(80vh-200px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
                    {recentTrades.reverse().map(trade => {
                        return (
                            <SwapHistoryItem swap={trade} key={trade.swapTx} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
