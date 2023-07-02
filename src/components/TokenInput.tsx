import { classNames } from "@/helpers/classNames";
import { Chain, chainsInfo } from "@/types";
import Image from "next/image";
import { useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import { TokenSelector } from "./TokenSelector";

export const TokenInput = (props: { isOtherToken?: boolean }) => {
    const [showSelector, setShowSelector] = useState(!!props.isOtherToken);

    const [selectedChain, setSelectedChain] = useState<Chain>();

    return (
        <>
            <div
                className={classNames(
                    "w-full px-3 py-3 rounded-xl my-3 text-xl flex",
                    props.isOtherToken
                        ? "bg-slate-800 cursor-not-allowed"
                        : "bg-slate-900"
                )}
            >
                <div
                    onClick={() => setShowSelector(true)}
                    className="bg-slate-600 relative rounded-xl flex items-center justify-center px-3 py-1 font-bold gap-1 text-white cursor-pointer hover:bg-slate-500 transition-colors"
                >
                    <Image
                        className="relative"
                        width={24}
                        height={24}
                        alt="logo"
                        src="https://jup.ag/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FEPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v%2Flogo.png&w=48&q=75"
                    />
                    <span>
                        USDC
                        <span className="font-normal text-sm">
                            {selectedChain &&
                                chainsInfo[selectedChain].symbol.toLowerCase()}
                        </span>
                    </span>
                    <span>
                        <RxCaretDown />
                    </span>
                </div>
                <div className="flex-grow" />
                <div className="flex flex-col justify-end items-end gap-1">
                    <div className="font-bold text-white leading-5 text-2xl">
                        5.51488
                    </div>
                    <div className="text-sm font-normal text-slate-500 leading-5">
                        $20.1
                    </div>
                </div>
            </div>

            <TokenSelector
                show={showSelector}
                setShow={setShowSelector}
                selectedChain={selectedChain}
                setSelectedChain={setSelectedChain}
            />
        </>
    );
};
