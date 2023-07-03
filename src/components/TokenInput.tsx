import { classNames } from "@/helpers/classNames";
import { Chain, Token, chainsInfo } from "@/types";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import { TokenSelector } from "./TokenSelector";
import { TokenImage } from "./TokenImage";
import { toPrecision } from "@/helpers/number";

export const TokenInput = (props: {
    isOtherToken?: boolean;
    tradeLoading?: boolean;
    amount?: number;
    externalAmount?: number;
    setInputAmount?: (amount: number) => void;
    token?: Token;
    setToken: (token: Token) => void;
}) => {
    const [showSelector, setShowSelector] = useState(false);

    const [selectedChain, setSelectedChain] = useState<Chain>();

    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!inputRef.current || !props.externalAmount) {
            return;
        }
        inputRef.current.value = `${props.externalAmount}`;
    }, [props.externalAmount]);

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
                    {props.token ? (
                        <div className="flex items-center gap-1">
                            <TokenImage
                                src={props.token.token.image}
                                symbol={props.token.token.symbol}
                                size={24}
                            />
                            <div className="flex items-end">
                                {props.token.token.symbol}
                                <div className="font-normal text-sm">
                                    {chainsInfo[
                                        props.token.chain
                                    ].symbol.toLowerCase()}
                                </div>
                            </div>
                            <div>
                                <RxCaretDown />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-1">
                            <div className="w-7 h-7 bg-slate-900 rounded-full" />
                            <div className="flex items-end">
                                <div className="bg-gradient-to-r from-slate-900 to-slate-800 w-16 h-6 block rounded">
                                    &nbsp;
                                </div>
                            </div>
                            <div>
                                <RxCaretDown />
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex-grow" />
                <div className="flex flex-col justify-end items-end gap-1">
                    {props.setInputAmount ? (
                        <input
                            className="text-right font-bold text-white leading-5 text-2xl bg-slate-900 ring-0 border-0 focus:outline-none -my-1.5"
                            type="text"
                            ref={inputRef}
                            placeholder="Amount..."
                            onChange={e =>
                                props.setInputAmount?.(
                                    Math.max(0, parseFloat(e.target.value))
                                )
                            }
                        />
                    ) : (
                        <div className="font-bold text-white leading-5 text-2xl">
                            {!props.tradeLoading && props.amount ? (
                                toPrecision(props.amount, 6)
                            ) : props.tradeLoading ? (
                                <div className="animate-pulse rounded w-24 bg-gradient-to-r from-slate-900 to-slate-950 py-1 -mb-2">
                                    &nbsp;
                                </div>
                            ) : (
                                <span>&nbsp;</span>
                            )}
                        </div>
                    )}
                    <div className="text-sm font-normal text-slate-500 leading-5">
                        {props.amount && props.token?.token?.usdPrice ? (
                            <>
                                $
                                {toPrecision(
                                    props.amount *
                                        parseFloat(props.token.token.usdPrice),
                                    4
                                )}
                            </>
                        ) : (
                            <span>&nbsp;</span>
                        )}
                    </div>
                </div>
            </div>

            <TokenSelector
                show={showSelector}
                setShow={setShowSelector}
                selectedChain={selectedChain}
                setSelectedChain={setSelectedChain}
                setToken={props.setToken}
            />
        </>
    );
};