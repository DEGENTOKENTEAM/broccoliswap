import { getTxHistory, getTxHistoryItem } from "@/helpers/txHistory";
import { PiWarningBold } from "react-icons/pi";
import { useAccount } from "wagmi";

export const BridgeTokenStatusWarning = (props: {
    swapTx: string;
    onClick: Function;
}) => {
    const swap = getTxHistoryItem(props.swapTx);

    if (!swap) {
        return null;
    }

    return swap.bridge && swap.bridgeToTokenInfo && swap.bridgeToTokenInfo?.toSymbol !== swap.toSymbol ? (
        <PiWarningBold
            className="text-warning cursor-pointer"
            onClick={() => props.onClick(true)}
        />
    ) : null;
};
