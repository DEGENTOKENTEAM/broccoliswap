import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { classNames } from "@/helpers/classNames";
import { RiFileCopyFill, RiShareForward2Fill } from "react-icons/ri";
import { FaTelegramPlane, FaTwitter, FaDiscord, FaGlobe } from "react-icons/fa";
import { useProgress } from "@/hooks/useProgress";
import { Header } from "./Header";
import Link from "next/link";

const navigation = [
    { name: "Trade", href: "#", current: true },
    { name: "Portfolio", href: "#", current: false },
    { name: "Staking", href: "#", current: false }
];

const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD"
});

const DGNXPrice = () => {
    const [price, setPrice] = useState<number | null>(null);

    const updatePrice = async () => {
        const currentTime = new Date().getTime();
        fetch(
            `${process.env
                .NEXT_PUBLIC_BACKEND_ENDPOINT!}/ohlc/avalanche/0x51e48670098173025c477d9aa3f0eff7bf9f7812/${currentTime}/${currentTime}/1D/1`
        )
            .then(x => x.json())
            .then(data => {
                setPrice(data.bars[0].close);
            });
    };

    useEffect(() => {
        updatePrice();
    }, []);

    const progress = useProgress(updatePrice, 180);

    return (
        <>
            <div
                onClick={() => {
                    progress.click();
                }}
                className="radial-progress text-orange-600 mr-3 cursor-pointer"
                style={{
                    // @ts-ignore
                    "--value": progress.progress * 100,
                    "--size": "1.5rem"
                }}
            >
                <Image
                    src="/logo.png"
                    alt="Swap image"
                    unoptimized
                    width="18"
                    height="18"
                />
            </div>
            <span className="text-xs">
                DGNX {price ? formatter.format(price) : "..."}
            </span>
        </>
    );
};

export const BottomBar = () => {
    return (
        <div className="sm:bottom-0 lg:fixed text-center mb-10 sm:text-right sm:right-0 sm:mr-10">
            <Header className="text-xl">Powered By</Header>
            <Link href="https://dgnx.finance" target="_blank">
                <Header className="mb-5">
                    <span className="text-techGreen">DEGEN</span>
                    <span className="text-degenOrange">X</span>
                </Header>
            </Link>
            <div className="flex text-slate-200 items-center justify-center sm:justify-end gap-2 h-full text-2xl">
                {/* <a
                    href="https://coingecko.com/"
                    target="_blank"
                    rel="noreferrer"
                >
                    <Image
                        src="/cg.png"
                        alt="Coingecko"
                        unoptimized
                        width="20"
                        height="20"
                    />
                </a>
                <a href="https://bitquery.io/" target="_blank" rel="noreferrer">
                    <Image
                        src="/bitquery.png"
                        alt="Bitquery"
                        unoptimized
                        width="20"
                        height="20"
                    />
                </a>
                <a
                    href="https://rubic.exchange/"
                    target="_blank"
                    rel="noreferrer"
                >
                    <Image
                        src="/rubic.png"
                        alt="Rubic Exchange"
                        unoptimized
                        width="20"
                        height="20"
                    />
                </a> */}
                <a
                    href="https://dgnx.finance/"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaGlobe className="text-orange-500 hover:text-orange-600" />
                </a>
                <a
                    href="https://twitter.com/DegenEcosystem"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaTwitter className="text-orange-500 hover:text-orange-600" />
                </a>
                <a
                    href="https://t.me/DegenXportal"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaTelegramPlane className="text-orange-500 hover:text-orange-600" />
                </a>
                <a
                    href="https://discord.com/invite/pyaZqZrS"
                    target="_blank"
                    rel="noreferrer"
                >
                    <FaDiscord className="text-orange-500 hover:text-orange-600" />
                </a>
            </div>
        </div>
    );

    return (
        <div className="fixed bottom-0 w-full mt-10 bg-dark">
            <div className="mx-auto pl-2 sm:pl-3 lg:pl-3">
                <div className="relative flex h-10 items-center justify-between">
                    <div className="flex flex-1 h-full stems-center justify-start">
                        <div className="flex flex-grow"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
