import { toPrecision } from '@/helpers/number';
import { useMemo } from 'react';
import { BsFillArrowRightSquareFill, BsArrowUp, BsArrowDown } from 'react-icons/bs'

const getCGColor = (diff: number) => {
    if (Math.abs(diff) < 5) {
        return '';
    }

    if (diff < 0) { 
        return 'text-red-500'
    }

    return 'text-green-500';
}

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
            <div className="bg-slate-900 border border-orange-900 p-3 my-2 grid grid-cols-7 justify-center items-center gap-x-2 text-xl group">
                <div className="text-right col-span-3">{props.inputAmount} {props.inputName}</div>
                <div className="mx-auto col-span-1"><BsFillArrowRightSquareFill className="text-orange-600" /></div>
                <div className='col-span-3'>{props.outputAmount} {props.outputName}</div>
                <div className="text-right col-span-3 text-sm">≈${toPrecision(parseFloat(props.inputAmount)*parseFloat(props.fromTokenPrice || '0'), 4)}</div>
                <div className="mx-auto col-span-1" />
                <div className='col-span-3 text-sm'>≈${toPrecision(parseFloat(props.outputAmount)*parseFloat(props.toTokenPrice || '0'), 4)}</div>
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
                <div className={`${getCGColor(expectedCoingeckoAmountOut.amountOutDiff)}`}>
                    {toPrecision(Math.abs(expectedCoingeckoAmountOut.amountOutDiff), 2)}% {expectedCoingeckoAmountOut.amountOutDiff > 0
                        ? 'better than CG'
                        : 'worse than CG'
                    }
                </div>
            </div>}
        </div>
    )
};
