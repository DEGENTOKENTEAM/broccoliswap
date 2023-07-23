import { blockchainNameToChain, blockchainNameToChainID, chainIdToBlockchainName } from "@/helpers/chain";
import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import { calculateSwap } from "@/helpers/swap";
import { SwapType, putHistory } from "@/helpers/txHistory";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { Chain, NULL_ADDRESS, Token, chainsInfo } from "@/types";
import { waitForTransaction } from "@wagmi/core";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { useState } from "react";
import { RxCaretDown } from "react-icons/rx";
import { CrossChainTrade, OnChainTrade, UserRejectError } from "rubic-sdk";
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
    trade?: Awaited<Awaited<ReturnType<typeof calculateSwap>>['trade']>
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

const MaybeSwapButton = (props:{
    trade: OnChainTrade | CrossChainTrade,
    onSwapDone?: (tx: string, swapInputChain: Chain, swapOutputChain: Chain) => void ,
    inputToken?: Token,
    outputToken?: Token
}) => {
    const { address } = useAccount();
    
    const [approveTxHash, setApproveTxHash] = useState('')
    const [isSwapping, setIsSwapping] = useState(false)
    const [swapError, setSwapError] = useState('')
    const [buttonAction, setButtonAction] = useState<{ text: string, action: Function } | undefined>()

    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token:
            (props.trade as OnChainTrade | CrossChainTrade | undefined)?.from
                ?.address !== NULL_ADDRESS
                ? (props.trade as OnChainTrade | CrossChainTrade | undefined)
                      ?.from?.address as `0x${string}`
                : undefined,
        chainId: blockchainNameToChainID(props.trade?.from.blockchain)
    });

    const { data: approveTxLoaded, isLoading: approveTxLoading } = useWaitForTransaction({
        hash: approveTxHash as `0x${string}`,
    })

    const doSwap = async () => {
        console.log(props.trade)
        setIsSwapping(true);
        try {
            const tx = await props.trade.swap();
            setIsSwapping(false);

            const data = {
                swapTx: tx,
                fromChain: blockchainNameToChain(props.trade.from.blockchain).chain,
                toChain: blockchainNameToChain(props.trade.to.blockchain).chain,
                fromSymbol: props.trade.from.symbol,
                fromAddress: props.trade.from.address,
                fromLogo: props.inputToken?.token.image || '',
                toSymbol: props.trade.to.symbol,
                toAddress: props.trade.to.address,
                fromAmount: props.trade.from.tokenAmount.toNumber(),
                toAmount: props.trade.to.tokenAmount.toNumber(),
                toLogo: props.outputToken?.token.image || '',
            }
            
            // @ts-expect-error typeguard for cross chain trades
            if (props.trade?.bridgeType) {
                // @ts-expect-error typeguard for cross chain trades
                data.bridge = props.trade.type
                // @ts-expect-error typeguard for cross chain trades
                data.bridgeId = props.trade.id
                // @ts-expect-error typeguard for cross chain trades
                data.bridgeType = props.trade.bridgeType
            }

            putHistory(data);

            props.onSwapDone?.(tx, blockchainNameToChain(props.trade.from.blockchain).chain, blockchainNameToChain(props.trade.to.blockchain).chain);
        } catch (e) {
            if (e instanceof UserRejectError) {
                setIsSwapping(false);
                return;
            }

            setSwapError(JSON.stringify(e))
            setIsSwapping(false);
        }
    }

    useAsyncEffect(async () => {
        setButtonAction(undefined)

        const _needApprove = await props.trade.needApprove();

        if (_needApprove) {
            return setButtonAction({
                text: 'Approve',
                action: () => props.trade.approve.bind(props.trade)({ onTransactionHash: hash => setTimeout(() => setApproveTxHash(hash), 2000) })
            })
        }
        
        setButtonAction({
            text: 'Swap',
            action: doSwap
        })
    }, [props.trade, approveTxLoaded])

    if (swapError) {
        const tradeAmount = props.trade?.from?.tokenAmount?.toNumber() * parseFloat(props.inputToken?.token.usdPrice || '0');
        return (
            <>
                <div
                    className={classNames(
                        "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                        "cursor-not-allowed"
                    )}
                >
                    Something went wrong. Send this to Rock: {swapError}
                </div>
                <div className="bg-red-400 border-2 border-red-500 p-3 rounded-xl text-black">
                    We could not execute your swap because of an error.
                    {tradeAmount < 5 && props.trade.from.blockchain !== props.trade.to.blockchain && ` Most probably it failed because you try to bridge a very low amount ($${toPrecision(tradeAmount, 4)}). If you are bridging funds, please make sure the token value is at least $5.`}
                </div>
            </>
        )
    }

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

    if (isSwapping) {
        return (<div
                className={classNames(
                    "w-full mt-10 px-3 py-3 rounded-xl my-3 text-xl flex items-center justify-center text-orange-600 font-bold bg-slate-950 border-slate-950 border-2  transition-colors",
                    "cursor-not-allowed animate-pulse"
                )}
            >
                Executing swap...
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
    trade?: Awaited<Awaited<ReturnType<typeof calculateSwap>>['trade']>;
    onSwapDone?: (tx: string, swapInputChain: Chain, swapOutputChain: Chain) => void;
    inputToken?: Token,
    outputToken?: Token
}) => {
    const { isConnected } = useAccount();
    const { chain } = useNetwork();

    const buttonStatus = tradeStatusToButtonStatus(
        isConnected,
        chain,
        props.tradeLoading,
        props.trade,
    );

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
            <MaybeSwapButton inputToken={props.inputToken} outputToken={props.outputToken} trade={buttonStatus.trade} onSwapDone={props.onSwapDone} />
        );
    }

    return null;
};
