import { classNames } from "@/helpers/classNames";
import { getRecentTransactions } from "@/helpers/transactions";
import { explorersPerChain } from "@/helpers/variables";
import { useProgress } from "@/hooks/useProgress";
import { Token } from "@/__old__types";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Spinner } from "./Spinner";
import { toPrecision } from "@/helpers/number";

type RecentTransaction = {
    block: {
        timestamp: {
            time: string;
        };
        height: number;
    };
    tradeIndex: number;
    protocol: string;
    exchange: {
        fullName: string;
    };
    smartContract: {
        address: {
            address: string;
            annotation: null;
        };
    };
    baseAmount: number;
    baseCurrency: {
        address: string;
        symbol: string;
    };
    base_amount_usd: number;
    quoteAmount: number;
    quoteCurrency: {
        address: string;
        symbol: string;
    };
    quote_amount_usd: number;
    transaction: {
        hash: string;
    };
    side: string;
};

const navigation = [
    // { name: 'Info', href: '/trade/info/' },
    { name: "Trades", href: "/trade/trade/" }
];

export const Tokenbar = () => {
    const router = useRouter();

    return (
        <Disclosure as="nav" className="border-b border-t border-zinc-800">
            {({ open }) => (
                <>
                    <div className="mx-auto">
                        <div className="relative flex h-10 items-center justify-between">
                            <div className="flex flex-1 items-stretch justify-start">
                                <div className="block">
                                    <div className="flex">
                                        {navigation.map(item => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className={classNames(
                                                    router.asPath === item.href
                                                        ? "bg-zinc-800 text-slate-200"
                                                        : "text-gray-300 hover:bg-zinc-700 hover:text-slate-200",
                                                    "px-3 py-2 text-sm"
                                                )}
                                                aria-current={
                                                    router.asPath === item.href
                                                        ? "page"
                                                        : undefined
                                                }
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </Disclosure>
    );
};

const TokenInfoTab = (props: { token: Token }) => {
    return (
        <>
            <h2 className="text-slate-200 text-xl p-2">Token info</h2>
        </>
    );
};

const ProgressCircle = (props: { cb: () => Promise<void> }) => {
    const progress = useProgress(props.cb, 60);

    return (
        <div
            onClick={() => {
                progress.click();
            }}
            className="radial-progress text-orange-600 mr-3 cursor-pointer"
            // @ts-ignore
            style={{ "--value": progress.progress * 100, "--size": "1.5rem" }}
        />
    );
};

export const TokenTable = (props: { token: Token }) => {
    const [transactions, setTransactions] = useState<
        RecentTransaction[] | null
    >(null);

    useEffect(() => {
        getRecentTransactions(props.token.network, props.token.address).then(
            setTransactions
        );
    }, [props.token.network, props.token.address]);

    return (
        <>
            <div className="flex items-center">
                <h2 className="text-slate-200 flex-grow text-xl p-2">
                    Recent DEX trades
                </h2>
                <ProgressCircle
                    cb={() =>
                        getRecentTransactions(
                            props.token.network,
                            props.token.address
                        ).then(setTransactions)
                    }
                />
            </div>

            <div className="min-w-full flex flex-1 overflow-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-slate-700">
                <table className="min-w-full divide-y divide-gray-700 text-xs">
                    <thead>
                        <tr>
                            <th
                                scope="col"
                                className="py-1 px-3 text-left text-sm font-semibold text-slate-200"
                            >
                                Date
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-3 text-left text-sm font-semibold text-slate-200"
                            >
                                Type
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-3 text-left text-sm font-semibold text-slate-200"
                            >
                                Amount (quote)
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-3 text-left text-sm font-semibold text-slate-200"
                            >
                                Amount (base)
                            </th>
                            <th
                                scope="col"
                                className="py-1 px-3 text-left text-sm font-semibold text-slate-200"
                            >
                                Trade size
                            </th>
                            <th
                                scope="col"
                                className="relative py-1 pl-3 pr-4 sm:pr-0"
                            >
                                <span className="sr-only">View</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {!transactions && (
                            <tr>
                                <td
                                    className="text-white justify-center"
                                    colSpan={6}
                                >
                                    <Spinner />
                                </td>
                            </tr>
                        )}
                        {transactions &&
                            transactions.length > 0 &&
                            transactions?.map((transaction, i) => (
                                <tr key={i}>
                                    <td className="whitespace-nowrap py-1 px-3  text-gray-300">
                                        {transaction.block.timestamp.time}
                                    </td>
                                    <td
                                        className={classNames(
                                            "whitespace-nowrap py-1 px-3  text-gray-300",
                                            transaction.side === "BUY"
                                                ? "text-green-600"
                                                : "text-red-600"
                                        )}
                                    >
                                        {transaction.side}
                                    </td>
                                    <td className="whitespace-nowrap py-1 px-3  text-gray-300">{`${toPrecision(
                                        transaction.quoteAmount,
                                        2
                                    )} ${
                                        transaction.quoteCurrency.symbol
                                    }`}</td>
                                    <td className="whitespace-nowrap py-1 px-3  text-gray-300">{`${toPrecision(
                                        transaction.baseAmount,
                                        2
                                    )} ${transaction.baseCurrency.symbol}`}</td>
                                    <td className="whitespace-nowrap py-1 px-3  text-gray-300">
                                        $
                                        {toPrecision(
                                            transaction.quote_amount_usd,
                                            2
                                        )}
                                    </td>
                                    <td className="relative whitespace-nowrap py-1 pl-3 pr-4 text-right  font-medium">
                                        <a
                                            href={`${
                                                (explorersPerChain as any)[
                                                    props.token.network
                                                ]
                                            }/tx/${
                                                transaction.transaction.hash
                                            }`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-orange-500 hover:text-orange-900"
                                        >
                                            View
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        {transactions && transactions.length === 0 && (
                            <tr>
                                <td
                                    className="text-white text-center"
                                    colSpan={6}
                                >
                                    No recent transactions
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export const TokenInfo = (props: { token: Token }) => {
    const router = useRouter();

    console.log(router.asPath);

    return (
        <div className="flex flex-1 flex-col h-full">
            <Tokenbar />
            {router.asPath === "/pro/trade/trade/" && (
                <TokenTable token={props.token} />
            )}
            {router.asPath === "/pro/trade/info/" && (
                <TokenInfoTab token={props.token} />
            )}
        </div>
    );
};
