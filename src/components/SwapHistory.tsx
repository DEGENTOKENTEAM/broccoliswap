import moment from "moment";
import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import { JsonRpcProvider } from "@ethersproject/providers";
import {
    SwapType,
    TxHistoryItem,
    getTxHistory,
    updateBridgeTxStatus,
    updateHistory
} from "@/helpers/txHistory";
import useOutsideClick from "@/hooks/useOutsideClick";
import { useEffect, useRef, useState } from "react";
import { ImCross } from "react-icons/im";
import { GoArrowRight, GoLinkExternal } from "react-icons/go";
import Link from "next/link";
import { Chain, NULL_ADDRESS, chainsInfo, rubicRPCEndpoints } from "@/types";
import { TokenImage } from "./TokenImage";
import { RxCaretDown } from "react-icons/rx";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { IoMdRefresh } from "react-icons/io";
import { getSDK } from "@/helpers/rubic";
import useDisableScroll from "@/hooks/useDisableScroll";

import { CrossChainTradeType, TxStatus } from "rubic-sdk";
import { useAccount } from "wagmi";
import { ethers } from "ethers";
import { PiWarningBold } from "react-icons/pi";

const transferAbi = [
    {"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"}
];

const TokenAmount = (props: {
    address: string;
    logo: string;
    symbol: string;
    amount: number;
    chain: Chain;
}) => {
    return (
        <div className="bg-slate-600 relative rounded-xl flex items-center justify-center px-3 py-1 font-bold gap-1 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-1">
                <div className="relative">
                    <TokenImage
                        src={props.logo}
                        symbol={props.symbol}
                        size={24}
                    />

                    {props.address !== NULL_ADDRESS && (
                        <div className="absolute left-2 top-2">
                            <TokenImage
                                src={`/chains/${chainsInfo[props.chain].logo}`}
                                symbol={props.symbol}
                                size={14}
                            />
                        </div>
                    )}
                </div>
                <div>{toPrecision(props.amount, 4)}</div>
                <div className="flex items-end">{props.symbol}</div>
            </div>
        </div>
    );
};

const getBridgeTransferTokenStatus = async (
    address: `0x${string}`,
    swap: TxHistoryItem
) => {
    if (swap.bridgeToTokenInfo) {
        return swap.bridgeToTokenInfo
    }

    // Find a transfer function to the target address
    const chain = chainsInfo[swap.toChain].bitqueryChainName
    const response = await fetch(
            `${process.env
                .NEXT_PUBLIC_BACKEND_ENDPOINT!}/getBridgeTxInfo/${address}/${chain}/${swap.finalDstHash}`
        )
    const bridgeTxStatus = await response.json();
    
    // Update the swap record
    const status = {
        toAddress: address,
        toAmount: bridgeTxStatus?.info?.amount,
        toSymbol: bridgeTxStatus?.info?.currency.symbol,
        toTokenAddress: bridgeTxStatus?.info?.currency.address,
    }
    if (bridgeTxStatus?.info?.amount) {
        updateBridgeTxStatus(swap.swapTx, status)
    }

    return status as TxHistoryItem['bridgeToTokenInfo'];
}

const checkBridgeTransferTokenSuccess = async (
    address: `0x${string}` | undefined,
    swap: TxHistoryItem
): Promise<any> => {
    if (swap.finalStatus !== TxStatus.SUCCESS || !address || !swap.finalDstHash) {
        return;
    }
    
    const status = await getBridgeTransferTokenStatus(address, swap);

    if (!status?.toSymbol) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return checkBridgeTransferTokenSuccess(address, swap)
    }

    if (status.toSymbol !== swap.toSymbol) {
        return {
            status: 'failed',
            ...status
        }
    }

    return {
        status: 'success'
    }
};

const BridgeTokenStatusWarning = (props: {
    swapTx: string;
    setShowBridgeTokenWarning: Function;
    setBridgeTokenInfo: Function;
}) => {
    const [status, setStatus] = useState<Awaited<ReturnType<typeof checkBridgeTransferTokenSuccess>>>();
    const { address } = useAccount();
    const swap = getTxHistory().find((x) => x.swapTx === props.swapTx)!;

    useAsyncEffect(async () => {
        const _status = await checkBridgeTransferTokenSuccess(
            address,
            swap
        );
        setStatus(_status)
        props.setBridgeTokenInfo(status)
    }, [])

    console.log(swap,status)

    return status?.status === 'failed'
        ? <PiWarningBold className="text-yellow-600 cursor-pointer" onClick={() => props.setShowBridgeTokenWarning(true)} />
        : null;
}

const BridgeStatus = (props: { swap: TxHistoryItem, setBridgeTokenInfo: Function, setShowBridgeTokenWarning: Function }) => {
    const { swap } = props;
    const [status, setStatus] = useState<{
        status: TxStatus;
        hash: string | null;
    }>();

    const [forceRefreshVar, forceRefresh] = useState(0);

    useAsyncEffect(async () => {
        console.log(swap)
        if (
            swap.finalStatus &&
            swap.finalStatus !== TxStatus.PENDING
        ) {
            return setStatus({
                status: swap.finalStatus,
                hash: swap.finalDstHash || null,
            });
        }

        const sdk = await getSDK();
        try {
            const _status = await sdk.crossChainStatusManager.getCrossChainStatus(
                {
                    fromBlockchain:
                        chainsInfo[swap.fromChain].rubicSdkChainName,
                    toBlockchain: chainsInfo[swap.toChain].rubicSdkChainName,
                    txTimestamp: swap.date,
                    srcTxHash: swap.swapTx,

                    changenowId:
                        swap.bridge === "changenow" ? swap.bridgeId : undefined,
                    lifiBridgeType:
                        swap.bridge === "lifi" ? swap.bridgeType : undefined,
                    viaUuid: swap.bridge === "via" ? swap.bridgeId : undefined,
                    celerTransactionId:
                        swap.bridge === "celer" ? swap.bridgeId : undefined,
                    rangoRequestId:
                        swap.bridge === "rango" ? swap.bridgeId : undefined
                },
                swap.bridge! as CrossChainTradeType
            );

            setStatus({
                status: _status.dstTxStatus,
                hash: _status.dstTxHash,
            });

            updateHistory(
                swap.swapTx,
                _status.dstTxStatus,
                _status.dstTxHash || undefined
            );

            if (_status.dstTxStatus === TxStatus.PENDING) {
                await new Promise(resolve => setTimeout(resolve, 5000));
                forceRefresh(Math.random());
            }
        } catch (e) {
            setStatus({
                status: TxStatus.FAIL,
                hash: ""
            });
        }
    }, [forceRefreshVar]);
    if (status?.status === TxStatus.PENDING) {
        return (
            <div className="flex gap-1 items-center">
                Bridge pending
                <IoMdRefresh className="animate-spin" />
            </div>
        );
    }

    if (status?.status === TxStatus.SUCCESS) {
        return (
            <>
                <Link
                    className="flex gap-1 items-center px-2 py-1 rounded-xl hover:underline"
                    target="_blank"
                    href={`${chainsInfo[swap.toChain].explorer}tx/${status.hash}`}
                >
                    View dest tx
                    <GoLinkExternal />
                </Link>
                <BridgeTokenStatusWarning
                    swapTx={swap.swapTx}
                    setShowBridgeTokenWarning={props.setShowBridgeTokenWarning}
                    setBridgeTokenInfo={props.setBridgeTokenInfo}
                />
            </>
        );
    }

    return (
        <div className="flex gap-1 items-center px-2 py-1">Error bridging</div>
    );
};

const SwapHistoryItem = (props: { swap: TxHistoryItem }) => {
    const { swap } = props;

    const [bridgeTokenInfo, setBridgeTokenInfo] = useState<TxHistoryItem['bridgeToTokenInfo']>()
    const [showBridgeTokenWarning, setShowBridgeTokenWarning] = useState(false)

    return (
        <>
            <div className="col-span-12 sm:col-span-6 flex items-start sm:items-center mt-5 flex-col sm:flex-row gap-1">
                <div>Date:</div>
                <div>
                    {moment
                        .unix(swap.date / 1000)
                        .format("YYYY-MM-DD HH:mm:ss")}
                </div>
            </div>
            <div className="flex w-full items-center justify-start sm:justify-end col-span-12 sm:col-span-6 sm:mt-5">
                <Link
                    className="flex gap-1 items-center sm:px-2 py-1 rounded-xl hover:underline"
                    target="_blank"
                    href={`${chainsInfo[swap.fromChain].explorer}tx/${
                        swap.swapTx
                    }`}
                >
                    View {swap.bridge && "src tx"}
                    <GoLinkExternal />
                </Link>
                {swap.bridge && <BridgeStatus swap={swap} setShowBridgeTokenWarning={setShowBridgeTokenWarning} setBridgeTokenInfo={setBridgeTokenInfo} />}
            </div>
            <div className="col-span-5">
                <TokenAmount
                    address={swap.fromAddress}
                    logo={swap.fromLogo}
                    chain={swap.fromChain}
                    symbol={swap.fromSymbol}
                    amount={swap.fromAmount}
                />
            </div>
            <div className="flex justify-center items-center col-span-2">
                <GoArrowRight />
            </div>
            <div className="col-span-5">
                <TokenAmount
                    address={swap.toAddress}
                    logo={swap.toLogo}
                    chain={swap.toChain}
                    symbol={swap.toSymbol}
                    amount={swap.toAmount}
                />
            </div>
            {showBridgeTokenWarning && bridgeTokenInfo && <div className="flex flex-col w-full items-start justify-start col-span-12 mt-2 sm:mt-5 bg-yellow-400 border-2 border-yellow-500 p-3 rounded-xl text-black">
                The swap on the target chain to {swap.toSymbol} failed (most commonly because of slippage), therefore you did not receive {toPrecision(swap.toAmount, 4)} {swap.toSymbol} but {toPrecision(bridgeTokenInfo.toAmount || 0, 4)} {bridgeTokenInfo.toSymbol} on the {swap.toChain} chain. Click below to manually swap this {bridgeTokenInfo.toSymbol} to {swap.toSymbol}.
                <div className="flex items-center gap-2 mt-2">
                    <a href={`?inputChain=${swap.toChain}&inputToken=${bridgeTokenInfo.toTokenAddress}&outputChain=${swap.toChain}&outputToken=${swap.toAddress}&amount=${bridgeTokenInfo.toAmount}`}>
                        <button className="bg-yellow-500 transition-colors border-2 border-yellow-600 hover:bg-yellow-600 px-3 py-2 rounded-xl">Fix swap</button>
                    </a> - <button className="hover:underline" onClick={() => setShowBridgeTokenWarning(false)}>Close</button>
                </div>
            </div>}
        </>
    );
};

export const SwapHistory = (props: {
    show?: boolean;
    setShow?: (show: boolean) => void;
}) => {
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => props.setShow?.(false));
    useDisableScroll(props.show);

    const recentTrades = getTxHistory();

    return (
        <div
            className={classNames(
                "fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity ease-in z-10",
                props.show ? "opacity-100" : "opacity-0 pointer-events-none"
            )}
        >
            <div
                ref={divRef}
                className="max-w-2xl w-full m-5 bg-slate-700 p-5 rounded-xl relative z-20"
            >
                <div className="flex text-2xl text-white mb-3 items-center justify-center">
                    <h2 className="flex-grow">Swap History</h2>
                    <ImCross
                        className="text-xl cursor-pointer hover:text-orange-600 transition-colors"
                        onClick={() => props.setShow?.(false)}
                    />
                </div>
                <div className="w-full grid grid-cols-12 pr-3 gap-1 max-h-[calc(80vh-200px)] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-slate-800">
                    {recentTrades.reverse().map(trade => {
                        return (
                            <SwapHistoryItem swap={trade} key={trade.swapTx} />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
