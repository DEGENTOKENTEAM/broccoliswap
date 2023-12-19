import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import { CrossChainTrade, OnChainTrade } from "rubic-sdk";

export const ExtraTradeInfo = (props: { trade?: OnChainTrade | CrossChainTrade | string | null }) => {
    if (!props.trade || typeof props.trade === 'string') {
        return null;
    }

    const info = props.trade.getTradeInfo();
    
    if (props.trade.from.blockchain === props.trade.to.blockchain) {
        const trade = props.trade as OnChainTrade;
        return (
            <div className="flex flex-col w-full px-8 text-sm text-slate-400">
                <div className="flex w-full">
                    <div className="flex-grow">Minimum received</div>
                    <div>{toPrecision(trade.toTokenAmountMin.tokenAmount.toNumber(), 6)} {props.trade.to.symbol}</div>
                </div>
                <div className="flex w-full">
                    <div className="flex-grow" />
                    <div className="text-slate-500 text-xs">${toPrecision(trade.toTokenAmountMin.tokenAmount.toNumber() * trade.to.price.toNumber(), 6)}</div>
                </div>
                <div className="flex w-full">
                    <div className="flex-grow">Slippage</div>
                    <div>{(trade.slippageTolerance * 100).toFixed(2)}%</div>
                </div>
                {info.priceImpact && info.priceImpact > 0 ? <div className="flex w-full">
                    <div className="flex-grow">Price impact</div>
                    <div className={classNames(info.priceImpact > 5 && 'text-red-700 font-bold')}>{info.priceImpact.toFixed(2)}%</div>
                </div> : ''}
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
            {info.priceImpact && info.priceImpact > 0 && <div className="flex w-full">
                <div className="flex-grow">Price impact</div>
                <div className={classNames(info.priceImpact > 5 && 'text-red-700 font-bold')}>{info.priceImpact.toFixed(2)}%</div>
            </div>}
        </div>
    )
}