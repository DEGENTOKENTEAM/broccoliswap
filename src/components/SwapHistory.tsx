import moment from "moment";
import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import { getTxHistory } from "@/helpers/txHistory";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import useDisableScroll from "@/hooks/useDisableScroll";
import { SwapHistoryItem } from "./SwapHistory/HistoryItem";

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
