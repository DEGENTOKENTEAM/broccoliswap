import {
    useAccount,
    useBalance,
    useConnect,
    useDisconnect,
    useNetwork
} from "wagmi";
import { InjectedConnector } from "wagmi/connectors/injected";
import Image from "next/image";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/helpers/classNames";
import { SearchToken } from "./__old/SearchToken";
import { Token } from "@/__old__types";
import Link from "next/link";
import { useRouter } from "next/router";
import { ConnectKitButton } from "connectkit";
import { BridgeTokenStatusWarning } from "./SwapHistory/BridgeTokenStatusWarning";
import { getMostRecentTxHistoryItem } from "@/helpers/txHistory";
import { toPrecision } from "@/helpers/number";
import { TokenImage } from "./TokenImage";
import { chainsInfo } from "@/types";
import { chainFromChainId } from "@/helpers/chain";

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

    const chainInfo = chainFromChainId(chain?.id);

    return (
        <div className="flex gap-0.5 items-center p-0 -my-2">
            {balanceData && (
                <div className="border-r-2 border-activeblue flex items-center py-1 pr-2 mr-2">
                    <TokenImage
                        src={`/chains/${chainInfo.logo}`}
                        symbol={chainInfo.symbol}
                        size={16}
                    />
                    {toPrecision(parseFloat(balanceData?.formatted || "0"), 4)}
                </div>
            )}
            {address?.slice(0, 6)}...{address?.slice(address.length - 3)}
        </div>
    );
};

export const Navbar = (props: { onClickRecentTrades?: () => void }) => {
    return (
        <Disclosure as="nav" className="absolute top-0 w-full">
            {({ open }) => (
                <>
                    <div className="mx-auto">
                        <div className="flex sm:hidden mt-3 flex-grow items-center justify-center">
                            <div className="flex flex-shrink-0 items-center">
                                <Image
                                    src="/swap.png"
                                    alt="Swap image"
                                    unoptimized
                                    width="25"
                                    height="25"
                                />
                            </div>
                        </div>
                        <div className="relative m-3 flex h-10 items-center justify-between gap-3">
                            <div className="hidden sm:flex flex-grow items-start justify-start">
                                <div className="flex flex-shrink-0 items-start">
                                    <Image
                                        src="/swap.png"
                                        alt="Swap image"
                                        unoptimized
                                        width="25"
                                        height="25"
                                    />
                                </div>
                            </div>
                            <div className="flex-shrink-0 items-center">
                                <button
                                    onClick={() =>
                                        props.onClickRecentTrades?.()
                                    }
                                    className="bg-darkblue border-2 border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors"
                                >
                                    Recent Trades
                                    <BridgeTokenStatusWarning
                                        swapTx={
                                            getMostRecentTxHistoryItem().swapTx
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
