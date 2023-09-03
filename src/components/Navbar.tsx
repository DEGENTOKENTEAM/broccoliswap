import {
    useAccount,
    useBalance,
    useNetwork
} from "wagmi";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { classNames } from "@/helpers/classNames";
import { ConnectKitButton } from "connectkit";
import { BridgeTokenStatusWarning } from "./SwapHistory/BridgeTokenStatusWarning";
import { getMostRecentTxHistoryItem } from "@/helpers/txHistory";
import { toPrecision } from "@/helpers/number";
import { TokenImage } from "./TokenImage";
import { chainFromChainId } from "@/helpers/chain";
import { useState } from "react";

const navigation = [
    { name: "Trade", href: "/trade/trade" }
    // { name: 'Portfolio', href: '/portfolio' },
];

const ConnectedButton = () => {
    const { address } = useAccount();
    const { chain } = useNetwork();

    const { data: balanceData } = useBalance({
        address,
        chainId: chain?.id
    });

    let chainInfo;

    try {
        chainInfo = chainFromChainId(chain?.id);
    } catch (e) {
        return <div>Unsupported chain</div>
    }

    return (
        <div className="flex gap-0.5 items-center p-0 -my-2">
            {balanceData && (
                <div className="border-r-2 border-activeblue flex items-center py-1 pr-2 mr-2">
                    {chainInfo && <TokenImage
                        src={`/chains/${chainInfo.logo}`}
                        symbol={chainInfo.symbol}
                        size={16}
                    />}
                    {toPrecision(parseFloat(balanceData?.formatted || "0"), 4)}
                </div>
            )}
            <div className="hidden md:inline">{address?.slice(0, 6)}...{address?.slice(address.length - 3)}</div>
            <div className="md:hidden inline">{address?.slice(0, 5)}...{address?.slice(address.length - 2)}</div>
        </div>
    );
};

export const Navbar = (props: { onClickRecentTrades?: () => void }) => {
    const [iscleared,setiscleared] = useState('')
    return (
        <Disclosure as="nav" className="absolute top-0 w-full">
            {({ open }) => (
                <>
                    <div className="mx-auto">
                        <div className="flex sm:hidden mt-1 flex-grow items-center justify-center">
                            <div className="flex flex-shrink-0 items-center">
                                <Image
                                    src="/logo-full.svg"
                                    alt="Swap image"
                                    unoptimized
                                    width="285"
                                    height="50"
                                />
                            </div>
                        </div>
                        <div className="relative m-3 flex h-10 items-center justify-between gap-3">
                            <div className="hidden sm:flex flex-grow items-start justify-start">
                                <div className="flex flex-shrink-0 items-start">
                                    <Image
                                        src="/logo-full.svg"
                                        alt="Swap image"
                                        unoptimized
                                        width="285"
                                        height="50"
                                    />
                                </div>
                            </div>
                                <button onClick={(e) => { localStorage.clear();setiscleared('done') }}>CLEAR {iscleared}</button>
                            <div className="flex-shrink-0 items-center">
                                <button
                                    onClick={() =>
                                        props.onClickRecentTrades?.()
                                    }
                                    className="bg-darkblue border-2 border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors"
                                >
                                    Trade History
                                    <BridgeTokenStatusWarning
                                        swapTx={
                                            getMostRecentTxHistoryItem()?.swapTx
                                        }
                                        onClick={() =>
                                            props.onClickRecentTrades?.()
                                        }
                                    />
                                </button>
                            </div>
                            <ConnectKitButton.Custom>
                                {({ isConnected, show, address }) => {
                                    return (
                                        <button
                                            onClick={show}
                                            className={classNames(
                                                "bg-darkblue border-2 border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors"
                                            )}
                                        >
                                            {isConnected ? (
                                                <ConnectedButton />
                                            ) : (
                                                "Connect Wallet"
                                            )}
                                        </button>
                                    );
                                }}
                            </ConnectKitButton.Custom>
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    );
};
