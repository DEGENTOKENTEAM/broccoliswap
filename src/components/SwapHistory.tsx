import moment from "moment";
import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import { SwapType, TxHistoryItem, getTxHistory } from "@/helpers/txHistory";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useRef } from "react";
import { ImCross } from "react-icons/im";
import { GoArrowRight, GoLinkExternal } from "react-icons/go";
import Link from "next/link";
import { Chain, NULL_ADDRESS, chainsInfo } from "@/types";
import { TokenImage } from "./TokenImage";
import { RxCaretDown } from "react-icons/rx";

const TokenAmount = (props: {
    address: string;
    logo: string;
    symbol: string;
    amount: number;
    chain: Chain;
}) => {
    return (
        <div className="bg-slate-600 relative rounded-xl flex items-center justify-center px-3 py-1 font-bold gap-1 text-white">
            <div className="flex items-center gap-1">
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

const SwapHistoryItem = (props: { swap: TxHistoryItem }) => {
    const { swap } = props;

    if (swap.type === SwapType.ON_CHAIN) {
        return (
            <>
                <div className="col-span-8 flex items-center mt-5">
                    Date:{" "}
                    {moment
                        .unix(swap.date / 1000)
                        .format("YYYY-MM-DD HH:mm:ss")}
                </div>
                <div className="flex w-full items-center justify-end col-span-4 mt-5">
                    <Link
                        className="bg-slate-800 flex gap-1 items-center px-2 py-1 rounded-xl hover:bg-slate-600 transition-colors"
                        target="_blank"
                        href={`${chainsInfo[swap.fromChain].explorer}/tx/${
                            swap.swapTx
                        }`}
                    >
                        View
                        <GoLinkExternal />
                    </Link>
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
    }
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
                <div className="w-full grid grid-cols-12 gap-1">
                    {recentTrades.reverse().map((trade, i) => {
                        console.log("asd", trade);
                        return <SwapHistoryItem swap={trade} key={i} />;
                    })}
                </div>
            </div>
        </div>
    );
};
