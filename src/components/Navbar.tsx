import { Fragment } from 'react'
import Image from 'next/image'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { classNames } from '@/helpers/classNames'
import { SearchToken } from './SearchToken'
import { Token } from '@/types'
import Link from 'next/link'
import { useRouter } from 'next/router'

const navigation = [
    { name: 'Trade', href: '/trade/trade' },
    { name: 'Portfolio', href: '/portfolio' },
]

export const Navbar = (props: { setActiveToken: (token: Token) => void }) => {
    const router = useRouter()
    
    return (
        <Disclosure as="nav" className="border-b border-zinc-800">
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
                            <div className="flex items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">
                                    <Image src="/swap.png" alt="Swap image" unoptimized width="25" height="25" />
                                </div>
                                <div className="hidden sm:ml-3 sm:block">
                                    <div className="flex">
                                        {navigation.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    router.asPath.startsWith(item.href) ? 'bg-zinc-800 text-white' : 'text-gray-300 hover:bg-zinc-700 hover:text-white',
                                                    'px-3 py-2 text-sm'
                                                )}
                                                aria-current={router.asPath.startsWith(item.href) ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="text-slate-200 flex flex-grow justify-center">
                                <SearchToken setActiveToken={props.setActiveToken} />
                            </div>

                            <div className="absolute inset-y-0 right-0 flex items-center sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                <button
                                    type="button"
                                    className="bg-zinc-800 p-2 text-orange-500 hover:text-orange-600 hover:bg-orange-900 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                >
                                    <span>Connect wallet</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 px-2 pt-2 pb-3">
                            {navigation.map((item) => (
                                <Disclosure.Button
                                    key={item.name}
                                    as={Link}
                                    href={item.href}
                                    className={classNames(
                                        router.asPath.startsWith(item.href) ? 'bg-zinc-800 text-white' : 'text-gray-300 hover:bg-zinc-700 hover:text-white',
                                        'block px-3 py-2 text-base font-medium'
                                    )}
                                    aria-current={router.asPath.startsWith(item.href) ? 'page' : undefined}
                                >
                                    {item.name}
                                </Disclosure.Button>
                            ))}
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    )
}
