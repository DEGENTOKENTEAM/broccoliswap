import { toPrecision } from '@/helpers/number';
import { useMemo } from 'react';
import { BsFillArrowRightSquareFill, BsArrowUp, BsArrowDown } from 'react-icons/bs'

export const SwapDetails = (props: {
    inputAmount: string,
    inputName: string,
    outputAmount: string,
    outputName: string,
    slippage: number,
    minimumOutputAmount: string,
    priceImpact: number,
    fromTokenPrice?: string,
    toTokenPrice?: string
}) => {
    const expectedCoingeckoAmountOut = useMemo(() => {
        if (!props.fromTokenPrice || !props.toTokenPrice) {
            return null;
        }

        const fromTokenPrice = parseFloat(props.fromTokenPrice)
        const toTokenPrice = parseFloat(props.toTokenPrice)
        const expectedOutput = parseFloat(props.inputAmount) * fromTokenPrice / toTokenPrice;
        const amountOutDiff = (parseFloat(props.outputAmount) / expectedOutput * 100 - 100)
        return { expectedOutput, amountOutDiff }
    }, [props.fromTokenPrice, props.toTokenPrice, props.inputAmount])

    return (
        <div className="text-xs mt-3">
            <div className="bg-slate-900 border border-orange-900 p-3 my-2 flex justify-center items-center gap-2 text-xl group">
                <div>{props.inputAmount} {props.inputName}</div>
                <div><BsFillArrowRightSquareFill className="text-orange-600" /></div>
                <div>{props.outputAmount} {props.outputName}</div>
            </div>
            <h4 className="text-sm">Transaction details:</h4>
            <div className="flex">
                <div className="flex-grow">Slippage</div>
                <div>{props.slippage}%</div>
            </div>
            <div className="flex">
                <div className="flex-grow">Minimum output</div>
                <div>{props.minimumOutputAmount} {props.outputName}</div>
            </div>
            <div className="flex">
                <div className="flex-grow">Price impact</div>
                <div>{props.priceImpact > 0 ? props.priceImpact : '<0.01'}%</div>
            </div>
            {expectedCoingeckoAmountOut && <div className="flex">
                <div className="flex-grow">Coingecko comparison</div>
                <div className={`${expectedCoingeckoAmountOut.amountOutDiff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {toPrecision(Math.abs(expectedCoingeckoAmountOut.amountOutDiff), 2)}% {expectedCoingeckoAmountOut.amountOutDiff > 0
                        ? 'better than CG'
                        : 'worse than CG'
                    }
                </div>
            </div>}
        </div>
    )
};
