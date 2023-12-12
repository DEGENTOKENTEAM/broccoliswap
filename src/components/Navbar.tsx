import {
    useAccount,
    useBalance,
    useNetwork
} from "wagmi";
import Image from "next/image";
import { Disclosure } from "@headlessui/react";
import { classNames } from "@/helpers/classNames";
import { ConnectKitButton } from "connectkit";
import { BridgeTokenStatusWarning } from "./SwapHistory/BridgeTokenStatusWarning";
import { getMostRecentTxHistoryItem } from "@/helpers/txHistory";
import { toPrecision } from "@/helpers/number";
import { TokenImage } from "./TokenImage";
import { chainFromChainId } from "@/helpers/chain";
import { BiSearch } from "react-icons/bi";
import { TokenSelector } from "./TokenSelector";
import { useState } from "react";
import { Chain, Token } from "@/types";
import { BsFillGearFill } from "react-icons/bs";
import { SettingsDialog } from "./SettingsDialog";

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

    let chainInfo;

    try {
        chainInfo = chainFromChainId(chain?.id);
    } catch (e) {
        return <div>Unsupported chain</div>
    }

    return (
        <div className="flex gap-0.5 items-center p-0 -my-2">
            {balanceData && (
                <div className="border-r-2 border-activeblue flex items-center py-1 pr-2 mr-2">
                    {chainInfo && <TokenImage
                        src={`/chains/${chainInfo.logo}`}
                        symbol={chainInfo.symbol}
                        size={16}
                    />}
                    {toPrecision(parseFloat(balanceData?.formatted || "0"), 4)}
                </div>
            )}
            <div className="hidden md:inline">{address?.slice(0, 6)}...{address?.slice(address.length - 3)}</div>
            <div className="md:hidden inline">{address?.slice(0, 5)}...{address?.slice(address.length - 2)}</div>
        </div>
    );
};

export const Navbar = (props: {
    onClickRecentTrades?: () => void;
    proMode: boolean;
    setToken: (x: Token) => void
    setProMode: (x: boolean) => void
}) => {
    const [showSelector, setShowSelector] = useState(false);
    const [selectedChain, setSelectedChain] = useState<Chain>();
    const [showSettings, setShowSettings] = useState(false);

    return (
        <>
            <Disclosure as="nav" className="absolute top-0 w-full">
                {({ open }) => (
                    <>
                        <div className="bg-dark w-full text-center flex justify-center items-center border-b-2 border-activeblue text-xs py-1">
                            Always make sure you are connected on https://broccoliswap.com
                        </div>
                        <div className="mx-auto">
                            <div className="flex sm:hidden mt-1 flex-grow items-center justify-center">
                                <div className="flex flex-shrink-0 items-center">
                                    <Image
                                        src="/logo-full.svg"
                                        alt="Swap image"
                                        unoptimized
                                        width="285"
                                        height="50"
                                    />
                                </div>
                            </div>
                            <div className="relative m-3 flex h-10 items-center justify-between gap-3">
                                <div className="hidden sm:flex flex-grow items-start justify-start">
                                    <div className="flex flex-shrink-0 items-start">
                                        <Image
                                            src="/logo-full.svg"
                                            alt="Swap image"
                                            unoptimized
                                            width="285"
                                            height="50"
                                        />
                                    </div>
                                </div>
                                {props.proMode && <div className="hidden lg:flex flex-grow items-start justify-start">
                                    <div
                                        className="bg-dark border-2 cursor-pointer border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors"
                                        onClick={() => setShowSelector(true)}
                                    >
                                        <BiSearch /> Select Token
                                    </div>
                                </div>}
                                <div className="flex-shrink-0 items-center">
                                    <button
                                        onClick={() =>
                                            props.onClickRecentTrades?.()
                                        }
                                        className="bg-darkblue border-2 border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors"
                                    >
                                        Trade History
                                        <BridgeTokenStatusWarning
                                            swapTx={
                                                getMostRecentTxHistoryItem()?.swapTx
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
                                                    <>
                                                        <p className="inline sm:hidden">Connect</p>
                                                        <p className="hidden sm:inline">Connect Wallet</p>
                                                    </>
                                                )}
                                            </button>
                                        );
                                    }}
                                </ConnectKitButton.Custom>
                                <div
                                    className="bg-darkblue border-2 cursir-pointer border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors cursor-pointer"
                                    onClick={() => setShowSettings(true)}
                                >
                                    <BsFillGearFill className="text-2xl" />
                                </div>
                            </div>
                        </div>
                        {props.proMode && <div className="flex lg:hidden flex-grow items-start justify-center w-full">
                            <div
                                className="bg-dark border-2 cursor-pointer border-activeblue px-3 py-2 flex gap-1 items-center rounded-full text-light-200 hover:bg-activeblue transition-colors"
                                onClick={() => setShowSelector(true)}
                            >
                                <BiSearch /> Select Token
                            </div>
                        </div>}
                        <TokenSelector
                            show={showSelector}
                            setShow={setShowSelector}
                            selectedChain={selectedChain}
                            setSelectedChain={setSelectedChain}
                            setToken={props.setToken}
                            noNative
                        />
                        <SettingsDialog
                            show={showSettings}
                            setShow={setShowSettings}
                            proMode={props.proMode}
                            setProMode={props.setProMode}
                        />
                    </>
                )}
            </Disclosure>
        </>
    );
};
