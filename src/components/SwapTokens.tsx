import { classNames } from "@/helpers/classNames";
import Image from "next/image";
import { IoIosSwap } from "react-icons/io";
import { RxCaretDown } from "react-icons/rx";

export const SwapTokens = (props: { swapTokens: Function }) => {
    return (
        <div className="mt-5 w-full mx-auto flex items-center justify-center relative">
            <div className="absolute border-t-2 w-full border-activeblue" />
            <div
                className="bg-darkblue hover:bg-activeblue border-activeblue border-2 rounded-full text-2xl text-light-100 hover:text-slate-200 transition-colors cursor-pointer relative z-1 p-1"
                onClick={() => props.swapTokens()}
            >
                <IoIosSwap className="rotate-90" />
            </div>
        </div>
    );
};
