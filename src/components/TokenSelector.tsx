import Image from "next/image";
import { classNames } from "@/helpers/classNames";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import useOutsideClick from "@/hooks/useOutsideClick";
import { Chain, NULL_ADDRESS, RubicToken, EVMToken, chainsInfo } from "@/types";
import { useEffect, useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { BiLinkExternal } from "react-icons/bi";
import { searchToken } from "@/helpers/rubic";
import Link from "next/link";
import { debounce } from "@/helpers/debounce";
import { TokenImage } from "./TokenImage";
import { useAccount, useBalance, useNetwork } from "wagmi";
import { toPrecision } from "@/helpers/number";
import useDisableScroll from "@/hooks/useDisableScroll";
import { SubHeader } from "./SubHeader";
import { chainFromChainId } from "@/helpers/chain";
import { subAddress } from "@/helpers/address";

const TokenListItem = (props: {
    token: RubicToken;
    selectedChain?: Chain;
    onSelectToken: (token: EVMToken) => void;
}) => {
    const { address } = useAccount();
    const { data: balanceData } = useBalance({
        address,
        token:
            props.token.address !== NULL_ADDRESS
                ? props.token.address as `0x${string}`
                : undefined,
        chainId: props.selectedChain && chainsInfo[props.selectedChain].id
    });

    if (!props.selectedChain) {
        return null;
    }

    const token = props.token;
    return (
        <div
            className="hover:bg-activeblue p-3 m-2 rounded-xl cursor-pointer flex gap-3 items-center"
            onClick={() =>
                props.onSelectToken({ type: 'evm', chain: props.selectedChain!, token })
            }
        >
            <TokenImage src={token.image} symbol={token.symbol} />
            <div className="flex flex-col flex-grow">
                <div className="flex items-center gap-4">
                    <div className="leading-5 text-light-200">{token.symbol}</div>
                    {!token.address.startsWith("0x00000000000000") && (
                        <div className="text-xs bg-dark py-0.5 px-1.5 rounded">
                            <Link
                                href={`${
                                    chainsInfo[props.selectedChain].explorer
                                }token/${token.address}`}
                                target="_blank"
                                onClick={e => e.stopPropagation()}
                                className="flex items-center gap-1"
                            >
                                    {subAddress(token.address)}{" "}
                                    <BiLinkExternal />
                            </Link>
                        </div>
                    )}
                </div>
                <div className="text-xs leading-5">{token.name}</div>
            </div>
            {(balanceData?.value || 0) > 0 && <div className="flex flex-col gap-0 text-right">
                <div className="text-light-200 text-lg leading-5">{toPrecision(parseFloat(balanceData?.formatted || ''), 4)}</div>
                <div className="text-sm">{props.token.usdPrice && props.token.usdPrice !== '0' && `$${toPrecision(parseFloat(balanceData?.formatted || '') * parseFloat(props.token.usdPrice), 4)}`}</div>
            </div>}
        </div>
    );
};

const TokenListSkeletonItem = () => {
    return (
        <div className="hover:bg-slate-500 p-3 mr-2 rounded-xl cursor-pointer flex gap-3 items-center">
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
    setSelectedChain?: (chain?: Chain) => void;
    setToken: (token: EVMToken) => void;
    otherToken?: EVMToken
    noNative?: boolean;
}) => {
    const [tokens, setTokens] = useState<RubicToken[] | null>();
    const [searchFilter, setSearchFilter] = useState("");

    const { chain } = useNetwork();

    const searchRef = useRef<HTMLInputElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));

    useEffect(() => {
        if (searchRef.current) {
            searchRef.current.value = '';
        }
        setSearchFilter('');
    }, [props.show])

    useEffect(() => {
        if (props.show) {
            setTokens(null)
            setSearchFilter('')
            props.setSelectedChain?.(chain && chainFromChainId(chain.id)?.chain)
        }
    }, [props.show])
    useDisableScroll(props.show);

    useAsyncEffect(async () => {
        if (!props.show || !props.selectedChain) {
            return;
        }

        setTokens(null);
        const tokens: RubicToken[] = await searchToken(props.selectedChain, searchFilter, props.noNative);

        // Filter other token
        setTokens(tokens.filter(token => {
            if (props.otherToken && props.otherToken.chain === props.selectedChain && props.otherToken.token.address === token.address) {
                return false;
            }

            return true;
        }));
    }, [props.show, props.selectedChain, searchFilter]);

    const debouncedSearchFilter = debounce(setSearchFilter, 500);

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
                <div className="flex text-2xl text-light-200 mb-3 items-center justify-center">
                    <SubHeader className="flex-grow">Select Chain</SubHeader>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-activeblue transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                <div className="flex gap-3 flex-wrap">
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
                                    "p-3 border-2 rounded-xl cursor-pointer transition-colors ease-in flex flex-col items-center w-20 gap-2",
                                    props.selectedChain === chain
                                        ? "bg-activeblue border-activeblue"
                                        : "border-activeblue hover:bg-activeblue"
                                )}
                            >
                                <Image
                                    width={36}
                                    height={36}
                                    alt={chainInfo.name}
                                    src={`/chains/${chainInfo.logo}`}
                                />
                                {chainInfo.symbol.toUpperCase()}
                            </div>
                        );
                    })}
                </div>

                {props.selectedChain && (
                    <>
                        <SubHeader className="my-3 text-light-200">
                            Select Token
                        </SubHeader>
                        <input
                            type="text"
                            ref={searchRef}
                            placeholder="Search token name, symbol or address..."
                            className="bg-dark rounded border-2 border-activeblue focus:border-light-200 focus:outline-none w-full py-1 px-3 mb-3"
                            onChange={e =>
                                debouncedSearchFilter(e.target.value)
                            }
                        />
                        <div className="max-h-[calc(80vh-200px)] overflow-auto scrollbar-thin scrollbar-thumb-activeblue">
                            {tokens
                                ? tokens.map(token => (
                                      <TokenListItem
                                          key={token.address}
                                          token={token}
                                          selectedChain={props.selectedChain}
                                          onSelectToken={(token: EVMToken) => {
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
