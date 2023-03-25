import { Fragment } from 'react'
import Image from 'next/image'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { classNames } from '@/helpers/classNames'
import { RiFileCopyFill, RiShareForward2Fill } from "react-icons/ri"
import { FaTelegramPlane, FaTwitter, FaDiscord, FaGlobe } from "react-icons/fa"

const navigation = [
    { name: 'Trade', href: '#', current: true },
    { name: 'Portfolio', href: '#', current: false },
    { name: 'Staking', href: '#', current: false },
]

export const BottomBar = () => {
    return (
        <Disclosure as="nav" className="border-t border-zinc-800">
            {({ open }) => (
                <>
                    <div className="mx-auto pl-2 sm:pl-3 lg:pl-3">
                        <div className="relative flex h-10 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 hover:bg-zinc-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 h-full stems-center justify-start">
                                <div className="flex flex-shrink-0 items-center pr-2">
                                    <Image src="/logo.png" alt="Swap image" unoptimized width="25" height="25" />
                                </div>
                                <div className="flex text-slate-200 items-center border-r border-zinc-800 pr-2 h-full">
                                    $0.21
                                </div>
                                <div className="flex flex-grow"></div>
                                <div className="flex text-slate-200 items-center border-x border-zinc-800 px-2 h-full">
                                    <a className="px-1.5" href="https://dgnx.finance/" target="_blank" rel="noreferrer">
                                        <FaGlobe className="text-orange-500 hover:text-orange-600" />
                                    </a>
                                    <a className="px-1.5" href="https://twitter.com/DegenEcosystem" target="_blank" rel="noreferrer">
                                        <FaTwitter className="text-orange-500 hover:text-orange-600" />
                                    </a>
                                    <a className="px-1.5" href="https://t.me/DegenXportal" target="_blank" rel="noreferrer">
                                        <FaTelegramPlane className="text-orange-500 hover:text-orange-600" />
                                    </a>
                                    <a className="px-1.5" href="https://discord.com/invite/pyaZqZrS" target="_blank" rel="noreferrer">
                                        <FaDiscord className="text-orange-500 hover:text-orange-600" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>

                </>
            )}
        </Disclosure>
    )
}
