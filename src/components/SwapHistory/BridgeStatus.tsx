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
import { useState } from "react";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { useAccount } from "wagmi";

export const BridgeStatus = (props: {
    swapTx: string;
    setShowBridgeTokenWarning: Function;
}) => {
    const swap = getTxHistoryItem(props.swapTx);

    const { address } = useAccount();

    const [status, setStatus] = useState<{
        status: TxStatus;
        hash: string | null;
        bridgeStatus: TxHistoryItem["bridgeToTokenInfo"];
    }>();

    useAsyncEffect(async () => {
        checkBridgeStatus(address, '0x825e696b8387a01e695f0b36b5222f000dbcf37cdf9b492f526e136c763f1102', setStatus);
    }, []);

    console.log(status)

    return <p className="overflow-auto">{JSON.stringify(swap)}</p>

    // if (!swap) {
    //     return null;
    // }

    // if (status?.status === TX_STATUS.PENDING) {
    //     return (
    //         <div className="flex gap-1 px-2 items-center">
    //             Bridging
    //             <IoMdRefresh className="animate-spin" />
    //         </div>
    //     );
    // }

    // if (status?.status === TX_STATUS.SUCCESS && !status.bridgeStatus) {
    //     return (
    //         <div className="flex gap-1 px-2 items-center">
    //             Verifying tx
    //             <Link
    //                 className="flex gap-1 items-center px-2 py-1 rounded-xl hover:underline"
    //                 target="_blank"
    //                 href={`${chainsInfo[swap.toChain].explorer}tx/${
    //                     status.hash
    //                 }`}
    //             >
    //                 <GoLinkExternal />
    //             </Link>
    //             <IoMdRefresh className="animate-spin" />
    //         </div>
    //     );
    // }

    // if (status?.status === TX_STATUS.SUCCESS) {
    //     return (
    //         <>
    //             <Link
    //                 className="flex gap-1 items-center px-2 py-1 rounded-xl hover:underline"
    //                 target="_blank"
    //                 href={`${chainsInfo[swap.toChain].explorer}tx/${
    //                     status.hash
    //                 }`}
    //             >
    //                 View dest tx
    //                 <GoLinkExternal />
    //             </Link>
    //             <BridgeTokenStatusWarning
    //                 swapTx={swap.swapTx}
    //                 onClick={props.setShowBridgeTokenWarning}
    //             />
    //         </>
    //     );
    // }

    // return (
    //     <div className="flex gap-1 items-center px-2 py-1">Error bridging</div>
    // );
};
