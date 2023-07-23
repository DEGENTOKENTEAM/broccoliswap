import { getTxHistory, getTxHistoryItem } from "@/helpers/txHistory";
import { PiWarningBold } from "react-icons/pi";
import { useAccount } from "wagmi";

export const BridgeTokenStatusWarning = (props: {
    swapTx: string;
    setShowBridgeTokenWarning: Function;
}) => {
    const swap = getTxHistoryItem(props.swapTx);

    if (!swap) {
        return null;
    }

    return swap.bridgeToTokenInfo?.toSymbol !== swap.toSymbol ? (
        <PiWarningBold
            className="text-yellow-600 cursor-pointer"
            onClick={() => props.setShowBridgeTokenWarning(true)}
        />
    ) : null;
};
