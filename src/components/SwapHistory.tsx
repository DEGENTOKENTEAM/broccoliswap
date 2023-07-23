import moment from "moment";
import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import {
    TxHistoryItem,
    getTxHistory,
    getTxHistoryItem
} from "@/helpers/txHistory";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { GoArrowRight, GoLinkExternal } from "react-icons/go";
import Link from "next/link";
import { chainsInfo } from "@/types";
import useDisableScroll from "@/hooks/useDisableScroll";

import { TokenAmount } from "./SwapHistory/TokenAmount";
import { BridgeStatus } from "./SwapHistory/BridgeStatus";

const SwapHistoryItem = (props: { swapTx: string }) => {
    const [showBridgeTokenWarning, setShowBridgeTokenWarning] = useState(false);

    const swap = getTxHistoryItem(props.swapTx);

    if (!swap) {
        return null;
    }

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
                {swap.bridge && (
                    <BridgeStatus
                        swapTx={swap.swapTx}
                        setShowBridgeTokenWarning={setShowBridgeTokenWarning}
                    />
                )}
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
            {showBridgeTokenWarning && swap.bridgeToTokenInfo && (
                <div className="flex flex-col w-full items-start justify-start col-span-12 mt-2 sm:mt-5 bg-yellow-400 border-2 border-yellow-500 p-3 rounded-xl text-black">
                    The swap on the target chain to {swap.toSymbol} failed (most
                    commonly because of slippage), therefore you did not receive{" "}
                    {toPrecision(swap.toAmount, 4)} {swap.toSymbol} but{" "}
                    {toPrecision(swap.bridgeToTokenInfo.toAmount || 0, 4)}{" "}
                    {swap.bridgeToTokenInfo.toSymbol} on the {swap.toChain}{" "}
                    chain. Click below to manually swap this{" "}
                    {swap.bridgeToTokenInfo.toSymbol} to {swap.toSymbol}.
                    <div className="flex items-center gap-2 mt-2">
                        <a
                            href={`?inputChain=${swap.toChain}&inputToken=${swap.bridgeToTokenInfo.toTokenAddress}&outputChain=${swap.toChain}&outputToken=${swap.toAddress}&amount=${swap.bridgeToTokenInfo.toAmount}`}
                        >
                            <button className="bg-yellow-500 transition-colors border-2 border-yellow-600 hover:bg-yellow-600 px-3 py-2 rounded-xl">
                                Fix swap
                            </button>
                        </a>{" "}
                        <button
                            className="hover:underline"
                            onClick={() => setShowBridgeTokenWarning(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export const SwapHistory = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));
    useDisableScroll(props.show);

    const recentTrades = getTxHistory();

    return (
        <div
            className={classNames(
                "fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity ease-in z-10",
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
                <div className="w-full grid grid-cols-12 pr-3 gap-1 max-h-[calc(80vh-200px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
                    {recentTrades.reverse().map(trade => {
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
