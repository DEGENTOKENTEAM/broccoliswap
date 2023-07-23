import { classNames } from "@/helpers/classNames";
import useDisableScroll from "@/hooks/useDisableScroll";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useRef } from "react";
import { ImCross } from "react-icons/im";
import { SubHeader } from "./SubHeader";

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
    useDisableScroll(props.show);

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
                "fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity ease-in z-10",
                props.show ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div
                ref={divRef}
                className="max-w-2xl w-full m-5 bg-darkblue border-2 border-activeblue p-5 rounded-xl relative z-20"
            >
                <div className="flex text-2xl text-white mb-3 items-center justify-center">
                    <SubHeader className="flex-grow">Set Slippage</SubHeader>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-activeblue transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                {props.slippage && props.slippage < tokenTax && (
                    <div className="bg-dark border-2 border-rusty p-3 rounded-xl text-light-200 font-bold text-center my-3">
                        The slippage you have selected is less than what you
                        will need for token taxes. This means the transaction
                        will most likely fail. Please make sure the slippage
                        includes all token taxes (which is {tokenTax}
                        %). Suggested taxes are below.
                    </div>
                )}
                {props.slippage && props.slippage - tokenTax > 10 && (
                    <div className="bg-dark border-2 border-rusty p-3 rounded-xl text-light-200 font-bold text-center my-3">
                        You have selected a very high slippage, even when
                        accounting for the token taxes. Please make sure you
                        know what you are doing!
                    </div>
                )}
                <div className="flex gap-2">
                    <div
                        className="bg-darkblue hover:bg-activeblue border-2 border-activeblue transition-colors px-3 py-1 rounded-full cursor-pointer text-light-200"
                        onClick={() => onSetSlippage(1 + tokenTax)}
                    >
                        {1 + tokenTax}%
                    </div>
                    <div
                        className="bg-darkblue hover:bg-activeblue border-2 border-activeblue transition-colors px-3 py-1 rounded-full cursor-pointer text-light-200"
                        onClick={() => onSetSlippage(2 + tokenTax)}
                    >
                        {2 + tokenTax}%
                    </div>
                    <div
                        className="bg-darkblue hover:bg-activeblue border-2 border-activeblue transition-colors px-3 py-1 rounded-full cursor-pointer text-light-200"
                        onClick={() => onSetSlippage(4 + tokenTax)}
                    >
                        {4 + tokenTax}%
                    </div>
                    <div className="flex">
                        <input
                            type="text"
                            ref={inputRef}
                            className="bg-darkblue w-24 border-activeblue border-2 focus:outline-none px-3 py-1 rounded-l-full"
                            placeholder="Custom..."
                        />
                        <div
                            onClick={() => onSetSlippage()}
                            className="bg-darkblue hover:bg-activeblue border-2 border-activeblue transition-colors px-3 py-1 rounded-r-full border-l cursor-pointer text-light-200"
                        >
                            Set
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
