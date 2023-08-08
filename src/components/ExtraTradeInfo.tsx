import { toPrecision } from "@/helpers/number";
import { CrossChainTrade, OnChainTrade } from "rubic-sdk";

export const ExtraTradeInfo = (props: { trade?: OnChainTrade | CrossChainTrade | string | null }) => {
    if (!props.trade || typeof props.trade === 'string') {
        return null;
    }
console.log(props.trade.getTradeInfo())

    if (props.trade.from.blockchain === props.trade.to.blockchain) {
        const trade = props.trade as OnChainTrade;
        return (
            <div className="flex flex-col w-full px-8 text-sm text-slate-400">
                <div className="flex w-full">
                    <div className="flex-grow">Minimum received</div>
                    <div>{toPrecision(trade.toTokenAmountMin.tokenAmount.toNumber(), 6)} {props.trade.to.symbol}</div>
                </div>
                <div className="flex w-full">
                    <div className="flex-grow">Slippage</div>
                    <div>{trade.slippageTolerance * 100}%</div>
                </div>
                <div className="flex w-full">
                    <div className="flex-grow">Price impact</div>
                    <div>{trade.priceImpact}%</div>
                </div>
            </div>
        )
    }

    const trade = props.trade as CrossChainTrade;
    return (
        <div className="flex flex-col w-full px-8 text-sm text-slate-400">
            <div className="flex w-full">
                <div className="flex-grow">Minimum received</div>
                <div>{toPrecision(trade.toTokenAmountMin.toNumber(), 6)} {props.trade.to.symbol}</div>
            </div>
            <div className="flex w-full">
                <div className="flex-grow">Slippage</div>
                <div>{trade.getTradeInfo().slippage}%</div>
            </div>
            <div className="flex w-full">
                <div className="flex-grow">Price impact</div>
                <div>{trade.getTradeInfo().priceImpact}%</div>
            </div>
        </div>
    )
}