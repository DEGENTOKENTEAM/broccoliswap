import { GoLinkExternal } from "react-icons/go";
import { BridgeTokenStatusWarning } from "./BridgeTokenStatusWarning";
import Link from "next/link";
import { chainsInfo } from "@/types";
import { TX_STATUS, TxStatus } from "rubic-sdk";
import { IoMdRefresh } from "react-icons/io";
import {
    TxHistoryItem,
    checkBridgeStatus,
    getTxHistoryItem
} from "@/helpers/txHistory";
import { useRef, useState } from "react";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useAccount } from "wagmi";
import { FaInfoCircle } from "react-icons/fa";
import useOutsideClick from "@/hooks/useOutsideClick";
import { ImCross } from "react-icons/im";
import { SubHeader } from "../SubHeader";
import { classNames } from "@/helpers/classNames";

export const BridgeStatus = (props: {
    swapTx: string;
    setShowBridgeTokenWarning: Function;
}) => {
    const swap = getTxHistoryItem(props.swapTx);
    const [showBridgeInfo, setShowBridgeInfo] = useState(false);
    const divRef = useRef<HTMLDivElement>(null);
    useOutsideClick([divRef], () => setShowBridgeInfo(false));

    const { address } = useAccount();

    const [status, setStatus] = useState<{
        status: TxStatus;
        hash: string | null;
        bridgeStatus: TxHistoryItem["bridgeToTokenInfo"];
    }>();

    useAsyncEffect(async () => {
        checkBridgeStatus(address, props.swapTx, setStatus);
    }, []);

    if (!swap) {
        return null;
    }

    if (status?.status === TX_STATUS.PENDING) {
        return (
            <div className="flex gap-1 px-2 items-center">
                Bridging
                <IoMdRefresh className="animate-spin" />
            </div>
        );
    }

    if (status?.status === TX_STATUS.SUCCESS && !status.bridgeStatus) {
        return (
            <div className="flex gap-1 px-2 items-center">
                Verifying tx
                <Link
                    className="flex gap-1 items-center px-2 py-1 rounded-xl hover:underline"
                    target="_blank"
                    href={`${chainsInfo[swap.toChain].explorer}tx/${
                        status.hash
                    }`}
                >
                    <GoLinkExternal />
                </Link>
                <IoMdRefresh className="animate-spin" />
            </div>
        );
    }

    if (status?.status === TX_STATUS.SUCCESS) {
        return (
            <>
                <Link
                    className="flex gap-1 items-center px-2 py-1 rounded-xl hover:underline"
                    target="_blank"
                    href={`${chainsInfo[swap.toChain].explorer}tx/${
                        status.hash
                    }`}
                >
                    View dest tx
                    <GoLinkExternal />
                </Link>
                <BridgeTokenStatusWarning
                    swapTx={swap.swapTx}
                    onClick={props.setShowBridgeTokenWarning}
                />
            </>
        );
    }

    if (status?.status === TX_STATUS.FAIL) {
        return (
            <>
                <div className="flex gap-1 items-center px-2 py-1 cursor-pointer" onClick={() => setShowBridgeInfo(true)}>
                    Error bridging
                    <FaInfoCircle />
                </div>
                <div
                    className={classNames(
                        "fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center bg-[rgba(0,0,0,0.4)] transition-opacity ease-in z-20",
                        showBridgeInfo ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                >
                    <div
                        ref={divRef}
                        className="max-w-2xl w-full m-5 bg-darkblue border-2 border-activeblue p-5 rounded-xl relative z-20"
                    >
                        <div className="flex text-2xl text-light-200 mb-3 items-center justify-center">
                            <SubHeader className="flex-grow">Bridge Error</SubHeader>
                            <ImCross
                                className="text-xl cursor-pointer hover:text-activeblue transition-colors"
                                onClick={() => setShowBridgeInfo(false)}
                            />
                        </div>
                        <p>
                            Something went wrong bridging, please open a support ticket in our
                            {' '}<a className="text-degenOrange" href="https://discord.com/invite/pyaZqZrS" target="_blank" rel="noreferrer">Discord</a>{' '}
                            channel so we can help you. Please include the following information:
                        </p>
                        <textarea disabled className="w-full h-16 p-3 bg-dark">
                            {JSON.stringify({ swap, status })}
                        </textarea>
                    </div>
                </div>
            </>
        );
    }

    return null;
};
