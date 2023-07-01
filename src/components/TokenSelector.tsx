import { classNames } from "@/helpers/classNames";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import useOutsideClick from "@/hooks/useOutsideClick";
import { Chain, chainsInfo } from "@/types";
import Image from "next/image";
import { useRef, useState } from "react";
import { RxCaretDown } from "react-icons/rx";

const TokenSelectModal = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
    selectedChain?: Chain;
    setSelectedChain?: (chain: Chain) => void;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));

    useAsyncEffect(async () => {
        if (!props.show || !props.selectedChain) {
            return;
        }

        // Fetch tokens from active chain
    }, [props.show, props.selectedChain]);

    if (!props.show) {
        // return null;
    }

    return (
        <div
            className={classNames(
                "absolute top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity z-10",
                props.show ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div
                ref={divRef}
                className="max-w-2xl w-full m-5 bg-slate-700 p-5 rounded-xl relative z-20"
            >
                <h2 className="text-2xl text-white mb-3">Select Chain</h2>
                <div className="flex gap-3">
                    {Object.entries(chainsInfo).map(([chain, chainInfo]) => {
                        return (
                            <div
                                key={chainInfo.id}
                                onClick={() =>
                                    props.setSelectedChain?.(
                                        Chain[chain as keyof typeof Chain]
                                    )
                                }
                                className={classNames(
                                    "p-3 border-2 rounded-xl cursor-pointer",
                                    props.selectedChain === chain
                                        ? "border-orange-600"
                                        : "border-slate-800 hover:border-slate-400"
                                )}
                            >
                                <Image
                                    width={36}
                                    height={36}
                                    alt={chainInfo.name}
                                    src={`/chains/${chainInfo.logo}`}
                                />
                            </div>
                        );
                    })}
                </div>

                {props.selectedChain && (
                    <h2 className="text-2xl text-white my-3">Select Token</h2>
                )}
            </div>
        </div>
    );
};

export const TokenSelector = (props: { isOtherToken?: boolean }) => {
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
                    className="bg-slate-600 rounded-xl flex items-center justify-center px-3 py-1 font-bold gap-2 text-white cursor-pointer hover:bg-slate-500 transition-colors"
                >
                    <Image
                        width={24}
                        height={24}
                        alt="logo"
                        src="https://jup.ag/_next/image?url=https%3A%2F%2Fraw.githubusercontent.com%2Fsolana-labs%2Ftoken-list%2Fmain%2Fassets%2Fmainnet%2FEPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v%2Flogo.png&w=48&q=75"
                    />
                    <span>USDC</span>
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

            <TokenSelectModal
                show={showSelector}
                setShow={setShowSelector}
                selectedChain={selectedChain}
                setSelectedChain={setSelectedChain}
            />
        </>
    );
};
