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

export const Navbar = () => {
    const router = useRouter();

    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const { connect } = useConnect({
        connector: new InjectedConnector()
    });
    const { disconnect } = useDisconnect();

    return (
        <Disclosure as="nav" className="">
            {({ open }) => (
                <>
                    <div className="mx-auto">
                        <div className="relative m-3 flex h-10 items-center justify-between">
                            <div className="flex items-center justify-center">
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
                            <ConnectKitButton
                                label="Connect"
                                options={{ initialChainId: 0 }}
                                showAvatar={false}
                                showBalance={true}
                                customTheme={{
                                    "--ck-connectbutton-background": "#030616",
                                    "--ck-connectbutton-active-background":
                                        "#030616",
                                    "--ck-connectbutton-hover-background":
                                        "#111729",
                                    "--ck-connectbutton-color": "#ffffff",
                                    "--ck-connectbutton-border-radius": "8px",
                                    "--ck-font-family": "Ysabeau Infant"
                                }}
                            />
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pt-2 pb-3">
                            {navigation.map(item => (
                                <Disclosure.Button
                                    key={item.name}
                                    as={Link}
                                    href={item.href}
                                    className={classNames(
                                        router.asPath.startsWith(item.href)
                                            ? "bg-zinc-800 text-white"
                                            : "text-gray-300 hover:bg-zinc-700 hover:text-white",
                                        "block px-3 py-2 text-base font-medium"
                                    )}
                                    aria-current={
                                        router.asPath.startsWith(item.href)
                                            ? "page"
                                            : undefined
                                    }
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
};
