import { classNames } from "@/helpers/classNames";
import Image from "next/image";
import { RiSwapFill } from "react-icons/ri";
import { RxCaretDown } from "react-icons/rx";

export const SwapTokens = () => {
    return (
        <div className="mt-5 w-full mx-auto flex items-center justify-center relative">
            <div className="absolute border-t w-full border-slate-900" />
            <div className="bg-slate-950 rounded-full text-3xl text-slate-400 hover:text-slate-200 transition-colors cursor-pointer relative z-1">
                <RiSwapFill />
            </div>
        </div>
    );
};
