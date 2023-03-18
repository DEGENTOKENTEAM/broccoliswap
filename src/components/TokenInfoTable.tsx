import { classNames } from '@/helpers/classNames'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'

const navigation = [
    { name: 'Transactions', href: '#', current: true },
    { name: 'Holders', href: '#', current: false },
    { name: 'Statistics', href: '#', current: false },
]

const people = [
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    { name: '0x23..dk', title: '$12.45', email: '2023-10-11 08:44:31' },
    // More people...
]

export const Tokenbar = () => {
    return (
        <Disclosure as="nav" className="border-b border-t border-zinc-800">
            {({ open }) => (
                <>
                    <div className="mx-auto">
                        <div className="relative flex h-10 items-center justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button*/}
                                <Disclosure.Button className="inline-flex items-center justify-center p-2 text-gray-400 hover:bg-zinc-700 hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                                    <span className="sr-only">Open main menu</span>
                                    {open ? (
                                        <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                    ) : (
                                        <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="hidden sm:block">
                                    <div className="flex">
                                        {navigation.map((item) => (
                                            <a
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    item.current ? 'bg-zinc-800 text-slate-200' : 'text-gray-300 hover:bg-zinc-700 hover:text-slate-200',
                                                    'px-3 py-2 text-sm'
                                                )}
                                                aria-current={item.current ? 'page' : undefined}
                                            >
                                                {item.name}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    )
}

export const TokenInfoTable = () => {
    return (
        <div className="flex flex-1 flex-col h-full">
            <Tokenbar />
            <h2 className="text-slate-200 text-xl p-2">Recent transactions</h2>

            <div className="min-w-full flex flex-1 overflow-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-slate-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th scope="col" className="py-1 pl-4 px-3 text-left text-sm font-semibold text-slate-200">
                                Hash
                            </th>
                            <th scope="col" className="py-1 px-3 text-left text-sm font-semibold text-slate-200">
                                Amount
                            </th>
                            <th scope="col" className="py-1 px-3 text-left text-sm font-semibold text-slate-200">
                                Date
                            </th>
                            <th scope="col" className="relative py-1 pl-3 pr-4 sm:pr-0">
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {people.map((person) => (
                            <tr key={person.email}>
                                <td className="whitespace-nowrap py-1 pl-4 pr-3 text-sm font-medium text-slate-200">
                                    {person.name}
                                </td>
                                <td className="whitespace-nowrap py-1 px-3 text-sm text-gray-300">{person.title}</td>
                                <td className="whitespace-nowrap py-1 px-3 text-sm text-gray-300">{person.email}</td>
                                <td className="relative whitespace-nowrap py-1 pl-3 pr-4 text-right text-sm font-medium">
                                    <a href="#" className="text-orange-500 hover:text-orange-900">
                                        View
                                    </a>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
