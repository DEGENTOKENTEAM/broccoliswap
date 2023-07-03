import { classNames } from "@/helpers/classNames";
import { calculateSwap } from "@/helpers/swap";
import { chainsInfo } from "@/types";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { RxCaretDown } from "react-icons/rx";
import { CrossChainTrade, OnChainTrade } from "rubic-sdk";
import {
    useAccount,
    useBalance,
    useConnect,
    useNetwork,
    useSwitchNetwork
} from "wagmi";

const chainIdToBlockchainName = (id?: number) => {
    const chain = Object.values(chainsInfo).find(info => info.id === id);

    if (!chain) {
        throw Error("Could not find chain");
    }

    return chain.rubicSdkChainName;
};

const blockchainNameToChainID = (blockchain?: string) => {
    const chain = Object.values(chainsInfo).find(
        info => info.rubicSdkChainName === blockchain
    );

    if (!chain) {
        throw Error("Could not find chain");
    }

    return chain.id;
};

const tradeStatusToButtonStatus = (
    isConnected: boolean,
    chain: ReturnType<typeof useNetwork>["chain"],
    tradeLoading: boolean,
    trade?: Awaited<ReturnType<typeof calculateSwap>>
) => {
    if (tradeLoading) {
        return { text: "Calculating route...", disabled: true };
    }

    if (!trade) {
        return { text: "Select route", disabled: true };
    }

    if (trade === "No trades available") {
        return { text: "No trades available", disabled: true };
    }

    if (trade === "Something went wrong") {
        return { text: "Something went wrong", disabled: true };
    }

    if (!isConnected) {
        return {
            disabled: false,
            buttonType: "connectButton"
        };
    }

    if (chainIdToBlockchainName(chain?.id) !== trade.from.blockchain) {
        return {
            disabled: false,
            buttonType: "switchNetworkButton",
            targetChainId: blockchainNameToChainID(trade.from.blockchain)
        };
    }

    return { text: "Swap", disabled: false, trade };
};

const SwitchNetworkButton = (props: { targetChainId?: number }) => {
    const { isLoading, switchNetwork } = useSwitchNetwork();
    return (
        <div
            onClick={() => switchNetwork?.(props.targetChainId)}
            className={classNames(
                "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                " ",
                isLoading
                    ? "animate-pulse cursor-not-allowed"
                    : "cursor-pointer hover:border-orange-600"
            )}
        >
            Switch Network
        </div>
    );
};

const MaybeSwapButton = (props: {trade: OnChainTrade | CrossChainTrade}) => {
    const { address } = useAccount();

    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token:
            (props.trade as OnChainTrade | CrossChainTrade | undefined)?.from
                ?.address !== "0x0000000000000000000000000000000000000000"
                ? (props.trade as OnChainTrade | CrossChainTrade | undefined)
                      ?.from?.address as `0x${string}`
                : undefined,
        chainId: blockchainNameToChainID((props.trade as OnChainTrade | CrossChainTrade | undefined)?.from.blockchain)
    });

    if (balanceData && props.trade.from.tokenAmount.toNumber() > parseFloat(balanceData.formatted)) {
        return (
            <div
                className={classNames(
                    "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                        "cursor-not-allowed"
                )}
            >
                Balance Too Low
            </div>
        )
    }

    return (<div
            className={classNames(
                "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                balanceIsLoading
                    ? "cursor-not-allowed"
                    : "hover:border-orange-600 cursor-pointer",
                balanceIsLoading && "animate-pulse"
            )}
        >
            Swap
        </div>
    )
}

export const SwapButton = (props: {
    tradeLoading: boolean;
    trade?: Awaited<ReturnType<typeof calculateSwap>>;
}) => {
    const { isConnected } = useAccount();
    const { chain } = useNetwork();

    const buttonStatus = tradeStatusToButtonStatus(
        isConnected,
        chain,
        props.tradeLoading,
        props.trade,
    );

    console.log(buttonStatus);

    if (buttonStatus.buttonType === "connectButton") {
        return (
            <ConnectKitButton.Custom>
                {({ isConnected, show, address }) => {
                    return (
                        <button
                            onClick={show}
                            className={classNames(
                                "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                                "hover:border-orange-600 cursor-pointer"
                            )}
                        >
                            Connect Wallet
                        </button>
                    );
                }}
            </ConnectKitButton.Custom>
        );
    }

    if (buttonStatus.buttonType === "switchNetworkButton") {
        return (
            <SwitchNetworkButton targetChainId={buttonStatus.targetChainId} />
        );
    }

    if (buttonStatus.disabled) {
        return <div
            className={classNames(
                "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                    "cursor-not-allowed",
                props.tradeLoading && "animate-pulse"
            )}
        >
            {buttonStatus?.text}
        </div>
    }

    if (buttonStatus.trade) {
        return (
            <MaybeSwapButton trade={buttonStatus.trade} />
        );
    }

    return null;
};
