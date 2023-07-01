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
                    <div className="mx-auto pl-2 sm:pl-3 lg:pl-3">
                        <div className="relative flex h-10 items-center justify-between">
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
                            {/* 
                            <div className="hidden lg:absolute inset-y-0 right-0 lg:flex items-center">
                                {isConnected && address && chain ? (
                                    <div className="flex items-center gap-2">
                                        <div className="text-xs">
                                            Connected as{" "}
                                            {address.substring(0, 5)}...
                                            {address!.substring(
                                                address.length - 3
                                            )}{" "}
                                            on {chain.name}
                                        </div>
                                        <button
                                            className="bg-zinc-800 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                            onClick={() => disconnect()}
                                        >
                                            Disconnect
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => connect()}
                                        className="bg-zinc-800 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                    >
                                        <span>Connect wallet</span>
                                    </button>
                                )}
                            </div> */}
                        </div>
                    </div>

                    <div className="flex lg:absolute inset-y-0 right-0 lg:hidden items-center">
                        {isConnected && address && chain ? (
                            <div className="flex w-full items-center gap-2 ml-3">
                                <div className="text-xs flex-grow">
                                    Connected as {address.substring(0, 5)}...
                                    {address!.substring(
                                        address.length - 3
                                    )} on {chain.name}
                                </div>
                                <button
                                    className="bg-zinc-800 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                    onClick={() => disconnect()}
                                >
                                    Disconnect
                                </button>
                            </div>
                        ) : (
                            <div className="flex w-full justify-end">
                                <button
                                    type="button"
                                    onClick={() => connect()}
                                    className="bg-zinc-800 p-2  text-orange-500 hover:text-orange-600 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span>Connect wallet</span>
                                </button>
                            </div>
                        )}
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
