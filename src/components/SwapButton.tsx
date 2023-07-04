import { blockchainNameToChainID, chainIdToBlockchainName } from "@/helpers/chain";
import { classNames } from "@/helpers/classNames";
import { calculateSwap } from "@/helpers/swap";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { NULL_ADDRESS, chainsInfo } from "@/types";
import { waitForTransaction } from "@wagmi/core";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import { CrossChainTrade, OnChainTrade } from "rubic-sdk";
import {
    useAccount,
    useBalance,
    useConnect,
    useNetwork,
    useSwitchNetwork,
    useWaitForTransaction
} from "wagmi";

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
    
    const [needApprove, setNeedApprove] = useState<boolean | null>(null)
    const [approveTxHash, setApproveTxHash] = useState('')
    const [buttonAction, setButtonAction] = useState<{ text: string, action: Function } | undefined>()

    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token:
            (props.trade as OnChainTrade | CrossChainTrade | undefined)?.from
                ?.address !== NULL_ADDRESS
                ? (props.trade as OnChainTrade | CrossChainTrade | undefined)
                      ?.from?.address as `0x${string}`
                : undefined,
        chainId: blockchainNameToChainID((props.trade as OnChainTrade | CrossChainTrade | undefined)?.from.blockchain)
    });

    const { data: approveTxLoaded, isLoading: approveTxLoading } = useWaitForTransaction({
        hash: approveTxHash as `0x${string}`,
    })

    const doSwap = async () => {
        // set swapping
        const tx = await props.trade.swap();
        // set swapped

        // set TX done modal thing
        console.log(tx)
    }

    useAsyncEffect(async () => {
        setButtonAction(undefined)

        const _needApprove = await props.trade.needApprove();
        console.log(_needApprove)
        setNeedApprove(_needApprove);

        if (_needApprove) {
            return setButtonAction({
                text: 'Approve',
                action: () => props.trade.approve.bind(props.trade)({ onTransactionHash: hash => setApproveTxHash(hash) })
            })
        }
        
        setButtonAction({
            text: 'Swap',
            action: doSwap
        })
    }, [props.trade, approveTxLoaded])

    if (balanceIsLoading) {
        return (<div
                className={classNames(
                    "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                    "cursor-not-allowed animate-pulse"
                )}
            >
                Loading balance
            </div>
        )
    }

    if (approveTxLoading) {
        return (<div
                className={classNames(
                    "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                    "cursor-not-allowed animate-pulse"
                )}
            >
                Approving...
            </div>
        )
    }

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

    if (buttonAction) {
        return (<div
                className={classNames(
                    "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                    "hover:border-orange-600 cursor-pointer",
                )}
                onClick={() => buttonAction.action()}
            >
                {buttonAction.text}
            </div>
        )
    }
    

    return null;
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
