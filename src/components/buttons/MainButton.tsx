import { calculateSwap } from "@/helpers/swap";
import { Chain, EVMToken, chainsInfo } from "@/types";
import { SwapButton } from "./SwapButton";
import { bridgeConfigs } from "@/helpers/celer";
import CelerBridgeButton from "./CelerBridgeButton";

export default function MainButton(props: {
    tradeLoading: boolean;
    trades?: Awaited<Awaited<ReturnType<typeof calculateSwap>>['trade']>;
    onSwapDone?: (tx: string, swapInputChain: Chain, swapOutputChain: Chain, swapInputToken: EVMToken, swapOutputToken: EVMToken) => void;
    inputToken?: EVMToken,
    outputToken?: EVMToken,
    inputTokenSellTax?: number,
    inputAmountInUsd?: number,
    inputAmount?: number,
    setShowRecentTrades?: Function
}) {
    // Check bridge button
    if (typeof props.trades !== 'string' && props.trades?.type === 'bridge') {
        return <CelerBridgeButton
            result={props.trades}
            setShowRecentTrades={props.setShowRecentTrades}
        />
    }

    return <SwapButton
        tradeLoading={props.tradeLoading}
        trades={typeof props.trades === 'string' ? props.trades : props.trades?.trades}
        onSwapDone={props.onSwapDone}
        inputToken={props.inputToken}
        outputToken={props.outputToken}
        inputTokenSellTax={props.inputTokenSellTax}
        inputAmountInUsd={props.inputAmountInUsd}
        inputAmount={props.inputAmount}
    />
};
