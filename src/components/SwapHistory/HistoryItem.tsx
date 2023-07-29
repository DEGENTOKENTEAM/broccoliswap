import { toPrecision } from "@/helpers/number";
import { getTxHistoryItem } from "@/helpers/txHistory";
import { chainsInfo } from "@/types";
import moment from "moment";
import Link from "next/link";
import { useState } from "react";
import { GoLinkExternal, GoArrowRight } from "react-icons/go";
import { BridgeStatus } from "./BridgeStatus";
import { TokenAmount } from "../SwapHistory/TokenAmount";

export const SwapHistoryItem = (props: { swapTx: string }) => {
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
                <div className="flex flex-col w-full items-start justify-start col-span-12 mt-2 sm:mt-5 bg-dark border-2 border-warning p-3 rounded-xl text-light-100 font-bold">
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
                            <button className="bg-darkblue transition-colors border-2 border-activeblue hover:bg-activeblue px-3 py-2 rounded-xl">
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
