import { classNames } from "@/helpers/classNames";
import Image from "next/image";
import { RxCaretDown } from "react-icons/rx";

export const SwapButton = () => {
    return (
        <div
            className={classNames(
                "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 cursor-pointer border-2 hover:border-orange-600 transition-colors"
            )}
        >
            Swap
        </div>
    );
};
