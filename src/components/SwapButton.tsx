import { classNames } from "@/helpers/classNames";
import { calculateSwap } from "@/helpers/swap";
import Image from "next/image";
import { RxCaretDown } from "react-icons/rx";

const tradeStatusToButtonStatus = (
    tradeLoading: boolean,
    trade?: Awaited<ReturnType<typeof calculateSwap>>
) => {
    if (tradeLoading) {
        return { text: "Calculating route...", disabled: true };
    }

    if (!trade) {
        return { text: "Select route", disabled: true };
    }

    if (trade === "No trades available") {
        return { text: "No trades available", disabled: true };
    }

    if (trade === "Something went wrong") {
        return { text: "Something went wrong", disabled: true };
    }

    return { text: "Swap", disabled: false };
};

export const SwapButton = (props: {
    tradeLoading: boolean;
    trade: Awaited<ReturnType<typeof calculateSwap>>;
}) => {
    const buttonStatus = tradeStatusToButtonStatus(
        props.tradeLoading,
        props.trade
    );
    return (
        <div
            className={classNames(
                "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                buttonStatus.disabled
                    ? "cursor-not-allowed"
                    : "hover:border-orange-600 cursor-pointer",
                props.tradeLoading && "animate-pulse"
            )}
        >
            {buttonStatus?.text}
        </div>
    );
};
