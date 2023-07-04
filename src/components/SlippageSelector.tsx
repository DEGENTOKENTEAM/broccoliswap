import { classNames } from "@/helpers/classNames";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useRef } from "react";
import { ImCross } from "react-icons/im";

export const SlippageSelector = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
    slippage?: number;
    setSlippage?: (slippage: number) => void;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));

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
                <div className="flex gap-2">
                    <div
                        className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-full cursor-pointer"
                        onClick={() => onSetSlippage(1)}
                    >
                        1%
                    </div>
                    <div
                        className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-full cursor-pointer"
                        onClick={() => onSetSlippage(2)}
                    >
                        2%
                    </div>
                    <div
                        className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-full cursor-pointer"
                        onClick={() => onSetSlippage(4)}
                    >
                        4%
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
                            className="bg-slate-800 hover:bg-slate-600 transition-colors px-3 py-1 rounded-r-full border-l border-slate-700 cursor-pointer"
                        >
                            Set
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
