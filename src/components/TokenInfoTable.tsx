import { classNames } from '@/helpers/classNames'
import { getRecentTransactions } from '@/helpers/transactions';
import { explorersPerChain } from '@/helpers/variables';
import { Token } from '@/types';
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'

type RecentTransaction = {
    block: {
        timestamp: {
            time: string
        },
        height: number
    },
    tradeIndex: number
    protocol: string
    exchange: {
        fullName: string
    },
    smartContract: {
        address: {
            address: string
            annotation: null
        }
    },
    baseAmount: number
    baseCurrency: {
        address: string
        symbol: string
    },
    base_amount_usd: number
    quoteAmount: number
    quoteCurrency: {
        address: string
        symbol: string
    },
    quote_amount_usd: number
    transaction: {
        hash: string
    }
    side: string
};

const navigation = [
    { name: 'Info', href: '#', current: false },
    { name: 'Trades', href: '#', current: true },
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

export const TokenInfoTable = (props: { token: Token }) => {
    const [transactions, setTransactions] = useState<RecentTransaction[]>([])

    useEffect(() => {
        getRecentTransactions(props.token.network, props.token.address).then(setTransactions)
    }, [props.token.network, props.token.address])

    return (
        <div className="flex flex-1 flex-col h-full">
            <Tokenbar />
            <h2 className="text-slate-200 text-xl p-2">Recent DEX trades</h2>

            <div className="min-w-full flex flex-1 overflow-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-slate-700">
                <table className="min-w-full divide-y divide-gray-700 text-xs">
                    <thead>
                        <tr>
                            <th scope="col" className="py-1 px-3 text-left text-sm font-semibold text-slate-200">
                                Date
                            </th>
                            <th scope="col" className="py-1 px-3 text-left text-sm font-semibold text-slate-200">
                                Type
                            </th>
                            <th scope="col" className="py-1 px-3 text-left text-sm font-semibold text-slate-200">
                                Amount (quote)
                            </th>
                            <th scope="col" className="py-1 px-3 text-left text-sm font-semibold text-slate-200">
                                Amount (base)
                            </th>
                            <th scope="col" className="py-1 px-3 text-left text-sm font-semibold text-slate-200">
                                Trade size ($)
                            </th>
                            <th scope="col" className="relative py-1 pl-3 pr-4 sm:pr-0">
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {transactions.map((transaction) => (
                            <tr key={transaction.transaction.hash}>
                                <td className="whitespace-nowrap py-1 px-3  text-gray-300">{transaction.block.timestamp.time}</td>
                                <td className={classNames('whitespace-nowrap py-1 px-3  text-gray-300', transaction.side === 'BUY' ? 'text-green-600' : 'text-red-600' )}>
                                    {transaction.side}
                                </td>
                                <td className="whitespace-nowrap py-1 px-3  text-gray-300">{`${transaction.quoteAmount.toFixed(2)} ${transaction.quoteCurrency.symbol}`}</td>
                                <td className="whitespace-nowrap py-1 px-3  text-gray-300">{`${transaction.baseAmount.toFixed(2)} ${transaction.baseCurrency.symbol}`}</td>
                                <td className="whitespace-nowrap py-1 px-3  text-gray-300">{transaction.quote_amount_usd.toFixed(2)}</td>
                                <td className="relative whitespace-nowrap py-1 pl-3 pr-4 text-right  font-medium">
                                    <a href={`${(explorersPerChain as any)[props.token.network]}/tx/${transaction.transaction.hash}`} target="_blank" rel="noreferrer" className="text-orange-500 hover:text-orange-900">
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
