import { classNames } from "@/helpers/classNames";
import { toPrecision } from "@/helpers/number";
import { calculateSwap } from "@/helpers/swap";
import { CrossChainTrade, OnChainTrade } from "rubic-sdk";

export const ExtraTradeInfo = (props: {
    trade?: Awaited<Awaited<ReturnType<typeof calculateSwap>>['trade']>
}) => {
    if (!props.trade || typeof props.trade === 'string') {
        return null;
    }

    if (props.trade.type === 'swap') {
        const trade = props.trade.trades?.[0]!;
        const info = trade.getTradeInfo();
        
        if (trade.from.blockchain === trade.to.blockchain) {
            const onChainTrade = trade as OnChainTrade;
            return (
                <div className="flex flex-col w-full px-8 text-sm text-slate-400">
                    <div className="flex w-full">
                        <div className="flex-grow">Minimum received</div>
                        <div>{toPrecision(onChainTrade.toTokenAmountMin.tokenAmount.toNumber(), 6)} {trade.to.symbol}</div>
                    </div>
                    <div className="flex w-full">
                        <div className="flex-grow" />
                        <div className="text-slate-500 text-xs">${toPrecision(onChainTrade.toTokenAmountMin.tokenAmount.toNumber() * trade.to.price.toNumber(), 6)}</div>
                    </div>
                    <div className="flex w-full">
                        <div className="flex-grow">Slippage</div>
                        <div>{(onChainTrade.slippageTolerance * 100).toFixed(2)}%</div>
                    </div>
                    {info.priceImpact && info.priceImpact > 0 ? <div className="flex w-full">
                        <div className="flex-grow">Price impact</div>
                        <div className={classNames(info.priceImpact > 5 && 'text-red-700 font-bold')}>{info.priceImpact.toFixed(2)}%</div>
                    </div> : ''}
                </div>
            )
        }

        const crossChainTrade = trade as CrossChainTrade;
        return (
            <div className="flex flex-col w-full px-8 text-sm text-slate-400">
                <div className="flex w-full">
                    <div className="flex-grow">Minimum received</div>
                    <div>{toPrecision(crossChainTrade.toTokenAmountMin.toNumber(), 6)} {crossChainTrade.to.symbol}</div>
                </div>
                {info.priceImpact && info.priceImpact > 0 && <div className="flex w-full">
                    <div className="flex-grow">Price impact</div>
                    <div className={classNames(info.priceImpact > 5 && 'text-red-700 font-bold')}>{info.priceImpact.toFixed(2)}%</div>
                </div>}
            </div>
        )
    }

    if (props.trade.type === 'bridge' && !props.trade.error) {
        const bridge = props.trade;
        return (
            <div className="flex flex-col w-full px-8 text-sm text-slate-400">
                <div className="flex w-full">
                    <div className="flex-grow">Estimated received</div>
                    <div>{toPrecision(bridge.estimation?.estimatedReceiveAmountNumber ?? 0, 6)} {bridge.bridgeConfig?.pegged_token.token.symbol}</div>
                </div>
                <div className="flex w-full">
                    <div className="flex-grow">Celer bridge fee</div>
                    <div>{toPrecision(bridge.estimation?.baseFee.toNumber() ?? 0, 6)} {bridge.bridgeConfig?.pegged_token.token.symbol}</div>
                </div>
            </div>
        )
    }

    return null;
}