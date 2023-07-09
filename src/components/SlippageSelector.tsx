import { classNames } from "@/helpers/classNames";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useRef } from "react";
import { ImCross } from "react-icons/im";

export const SlippageSelector = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
    slippage?: number;
    setSlippage?: (slippage: number) => void;
    tokenTax?: number;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));

    const tokenTax = props.tokenTax || 0;

    const onSetSlippage = (slippage?: number) => {
        if (!slippage) {
            slippage = parseFloat(inputRef.current?.value || "1");
        }
        props.setSlippage?.(slippage);
        props.setShow?.(false);
    };

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
                    <h2 className="flex-grow">Set Slippage</h2>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-orange-600 transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                {props.slippage && props.slippage < tokenTax && (
                    <div className="bg-yellow-400 border-2 border-yellow-500 p-3 rounded-xl text-black my-3">
                        The slippage you have selected is less than what you
                        will need for token taxes. This means the transaction
                        will most likely fail. Please make sure the slippage
                        includes all token taxes (which is {tokenTax}
                        %). Suggested taxes are below.
                    </div>
                )}
                {props.slippage && props.slippage - tokenTax > 10 && (
                    <div className="bg-yellow-400 border-2 border-yellow-500 p-3 rounded-xl text-black my-3">
                        You have selected a very high slippage, even when
                        accounting for the token taxes. Please make sure you
                        know what you are doing!
                    </div>
                )}
                <div className="flex gap-2">
                    <div
                        className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-full cursor-pointer text-slate-400"
                        onClick={() => onSetSlippage(1 + tokenTax)}
                    >
                        {1 + tokenTax}%
                    </div>
                    <div
                        className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-full cursor-pointer text-slate-400"
                        onClick={() => onSetSlippage(2 + tokenTax)}
                    >
                        {2 + tokenTax}%
                    </div>
                    <div
                        className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-full cursor-pointer text-slate-400"
                        onClick={() => onSetSlippage(4 + tokenTax)}
                    >
                        {4 + tokenTax}%
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            ref={inputRef}
                            className="bg-slate-800 w-24 focus:outline-none px-3 py-1 rounded-l-full"
                            placeholder="Custom..."
                        />
                        <div
                            onClick={() => onSetSlippage()}
                            className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-r-full border-l border-slate-700 cursor-pointer text-slate-400"
                        >
                            Set
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
