import { classNames } from "@/helpers/classNames";
import { useRef, useState } from "react";
import { FiSettings } from "react-icons/fi"
import { IoMdClose } from "react-icons/io"
import { AiOutlineCheckCircle } from "react-icons/ai"

export const SwapSettings = (props: {
    slippage: number,
    setSlippage: (slippage: number) => void
}) => {
    const slippageInputRef = useRef<HTMLInputElement>(null)
    const [swapSettingsOpen, setSwapSettingsOpen] = useState(false);

    const saveAndClose = () => {
        props.setSlippage(parseFloat(slippageInputRef.current!.value))
        setSwapSettingsOpen(false);
    }
    
    return (
        <div className="relative">
            <FiSettings className="cursor-pointer hover:text-orange-600" onClick={() => swapSettingsOpen ? saveAndClose() : setSwapSettingsOpen(true)} />
            <div className={classNames(
                "absolute w-64 right-0 border border-orange-600 bg-slate-900 p-3 z-10 mt-2 mr-2",
                swapSettingsOpen ? '' : 'hidden'
            )}>
                <div className="flex items-center gap-2 mb-3">
                    <h3 className="flex-grow text-md">Settings</h3>
                    <div>
                        <IoMdClose className="hover:text-orange-600 cursor-pointer" onClick={() => saveAndClose()} />
                    </div>
                </div>
                <div className="flex text-sm">
                    <p className="text-xs text-right">
                        Set slippage:{' '}
                        <span className={classNames("cursor-pointer hover:underline", props.slippage === 0.5 && 'underline')} onClick={() => { props.setSlippage(0.5); slippageInputRef.current!.value = '0.5'; }}>0.5%</span><span className="px-1">|</span>
                        <span className={classNames("cursor-pointer hover:underline", props.slippage === 1 && 'underline')} onClick={() => { props.setSlippage(1); slippageInputRef.current!.value = '1'; }}>1%</span><span className="px-1">|</span>
                        <span className="">
                            <input
                                ref={slippageInputRef}
                                type="text"
                                className="text-xs p-0 m-0 w-8 dark:bg-slate-900 border dark:border-dark-800 dark:text-slate-200"
                                defaultValue={props.slippage}
                            />%
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}