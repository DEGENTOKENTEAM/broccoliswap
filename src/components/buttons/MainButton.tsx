import { calculateSwap } from "@/helpers/swap";
import { Chain, Token, chainsInfo } from "@/types";
import { SwapButton } from "./SwapButton";
import { bridgeConfigs } from "@/helpers/celer";
import BridgeButton from "./BridgeButton";

export default function MainButton(props: {
    tradeLoading: boolean;
    trades?: Awaited<Awaited<ReturnType<typeof calculateSwap>>['trade']>;
    onSwapDone?: (tx: string, swapInputChain: Chain, swapOutputChain: Chain, swapInputToken: Token, swapOutputToken: Token) => void;
    inputToken?: Token,
    outputToken?: Token,
    inputTokenSellTax?: number,
    inputAmountInUsd?: number,
    inputAmount?: number,
    setShowRecentTrades?: Function
}) {
    // Check bridge button
    if (typeof props.trades !== 'string' && props.trades?.type === 'bridge') {
        return <BridgeButton
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
