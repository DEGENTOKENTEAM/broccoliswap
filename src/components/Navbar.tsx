import { useAccount, useConnect, useDisconnect, useNetwork } from "wagmi";
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

const navigation = [
    { name: "Trade", href: "/trade/trade" }
    // { name: 'Portfolio', href: '/portfolio' },
];

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
                                    className="bg-slate-600 px-3 py-2 rounded-xl text-white hover:bg-slate-400 transition-colors"
                                >
                                    Recent Trades
                                </button>
                            </div>
                            <ConnectKitButton
                                label="Connect"
                                showAvatar={false}
                                showBalance={true}
                                customTheme={{
                                    "--ck-body-color": "#97A3B6",
                                    "--ck-connectbutton-balance-background":
                                        "#030616",
                                    "--ck-connectbutton-balance-hover-background":
                                        "#4A5567",
                                    "--ck-connectbutton-background": "#4A5567",
                                    "--ck-connectbutton-active-background":
                                        "#4A5567",
                                    "--ck-connectbutton-hover-background":
                                        "#4A5567",
                                    "--ck-connectbutton-color": "#ffffff",
                                    "--ck-connectbutton-border-radius": "8px",
                                    "--ck-font-family": "Ysabeau Infant"
                                }}
                            />
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    );
};
