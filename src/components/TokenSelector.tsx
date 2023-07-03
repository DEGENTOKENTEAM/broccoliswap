import Image from "next/image";
import { classNames } from "@/helpers/classNames";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import useOutsideClick from "@/hooks/useOutsideClick";
import { Chain, RubicToken, Token, chainsInfo } from "@/types";
import { useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { BiLinkExternal } from "react-icons/bi";
import { searchToken } from "@/helpers/rubic";
import Link from "next/link";
import { debounce } from "@/helpers/debounce";
import { TokenImage } from "./TokenImage";

const TokenListItem = (props: {
    token: RubicToken;
    selectedChain?: Chain;
    onSelectToken: (token: Token) => void;
}) => {
    if (!props.selectedChain) {
        return null;
    }
    const token = props.token;
    return (
        <div
            className="hover:bg-slate-500 p-3 rounded-xl cursor-pointer flex gap-3 items-center"
            onClick={() =>
                props.onSelectToken({ chain: props.selectedChain!, token })
            }
        >
            <TokenImage src={token.image} symbol={token.symbol} />
            <div className="flex flex-col">
                <div className="flex items-center gap-3">
                    <div className="leading-5 text-white">{token.symbol}</div>
                    {!token.address.startsWith("0x0000") && (
                        <Link
                            href={`${
                                chainsInfo[props.selectedChain].explorer
                            }token/${token.address}`}
                            target="_blank"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-xs bg-slate-800 py-0.5 px-1.5 rounded flex items-center gap-1">
                                {token.address.slice(0, 5)}...{" "}
                                <BiLinkExternal />
                            </div>
                        </Link>
                    )}
                </div>
                <div className="text-xs leading-5">{token.name}</div>
            </div>
        </div>
    );
};

const TokenListSkeletonItem = () => {
    return (
        <div className="hover:bg-slate-500 p-3 rounded-xl cursor-pointer flex gap-3 items-center">
            <div className="w-8 h-8 bg-slate-900 rounded-full" />
            <div className="flex flex-col gap-1">
                <div className="from-slate-900 to-slate-800 bg-gradient-to-r w-32 h-5 rounded"></div>
                <div className="from-slate-900 to-slate-800 bg-gradient-to-r w-32 h-3 rounded"></div>
            </div>
        </div>
    );
};

export const TokenSelector = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
    selectedChain?: Chain;
    setSelectedChain?: (chain: Chain) => void;
    setToken: (token: Token) => void;
}) => {
    const [tokens, setTokens] = useState<RubicToken[] | null>();
    const [searchFilter, setSearchFilter] = useState("");

    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));

    useAsyncEffect(async () => {
        if (!props.show || !props.selectedChain) {
            return;
        }

        setTokens(null);
        const tokens = await searchToken(props.selectedChain, searchFilter);
        setTokens(tokens);
    }, [props.show, props.selectedChain, searchFilter]);

    const debouncedSearchFilter = debounce(setSearchFilter, 500);

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
                    <h2 className="flex-grow">Select Chain</h2>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-orange-600 transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                <div className="flex gap-3">
                    {Object.entries(chainsInfo).map(([chain, chainInfo]) => {
                        return (
                            <div
                                key={chainInfo.id}
                                onClick={() => {
                                    if (props.selectedChain === chain) {
                                        return;
                                    }
                                    props.setSelectedChain?.(
                                        Chain[chain as keyof typeof Chain]
                                    );
                                    setTokens(null);
                                }}
                                className={classNames(
                                    "p-3 border-2 rounded-xl cursor-pointer transition-colors ease-in",
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
                    <>
                        <h2 className="text-2xl text-white my-3">
                            Select Token
                        </h2>
                        <input
                            type="text"
                            placeholder="Search token name, symbol or address..."
                            className="bg-slate-800 rounded border border-slate-600 focus:border-slate-300 focus:outline-none w-full py-1 px-3 mb-3"
                            onChange={e =>
                                debouncedSearchFilter(e.target.value)
                            }
                        />
                        <div className=" max-h-[calc(80vh-200px)] overflow-auto scrollbar-thin scrollbar-thumb-slate-800">
                            {tokens
                                ? tokens.map(token => (
                                      <TokenListItem
                                          key={token.address}
                                          token={token}
                                          selectedChain={props.selectedChain}
                                          onSelectToken={(token: Token) => {
                                              props.setToken(token);
                                              props.setShow?.(false);
                                          }}
                                      />
                                  ))
                                : Array(10)
                                      .fill(null)
                                      .map((_, i) => (
                                          <TokenListSkeletonItem key={i} />
                                      ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};