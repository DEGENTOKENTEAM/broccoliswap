import Image from "next/image"; 
import { rubicNetworkToBitqueryNetwork, SearchResult, SwapSide, Token } from "@/types"
import { SearchToken } from "./SearchToken";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { MdSwapVert } from "react-icons/md"

const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    style: "currency",
    currency: "USD"
})

const ActiveToken = (props: { token: Token, amount?: number, setAmount: (amount: number) => void }) => {
    return (
        <div className="bg-slate-900 border border-orange-900 p-3 my-2 flex items-center gap-2 text-sm">
            {props.token.image  && <Image src={props.token.image} unoptimized width="25" height="25" alt={props.token.name} />}
            <div className="flex-grow">
                <div className="flex flex-col">
                    <div>{props.token.symbol}</div>
                    <div className="text-xs">{(rubicNetworkToBitqueryNetwork as any)[props.token.network]}</div>
                </div>
            </div>
            <div className="flex flex-col justify-end">
                <div>
                    <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="appearance-none w-full p-1 text-sm bg-transparent text-right text-gray-400 focus:outline-none"
                        style={{ 'appearance': 'none' }}
                        placeholder="Amount"
                        onChange={(e) => props.setAmount(parseFloat(e.target.value))}
                        defaultValue={props.amount ? props.amount : undefined}
                    />
                </div>
                <div className="text-xs text-right">~{props.token.price ? formatter.format((props.amount || 1) * parseFloat(props.token.price)) : '...'}</div>
            </div>
        </div>
    )
}

const OtherToken = (props: { token: Token, removeToken: Function }) => {
    return (
        <div className="relative bg-slate-900 border border-orange-900 p-3 my-2 flex items-center gap-2 text-sm group">
            {props.token.image && <Image src={props.token.image} unoptimized width="25" height="25" alt={props.token.name} />}
            <div className="flex-grow">
                <div className="flex flex-col">
                    <div>{props.token.symbol}</div>
                    <div className="text-xs">{props.token.network}</div>
                </div>
            </div>
            <div>{props.token.price ? formatter.format(parseFloat(props.token.price)) : '...'}</div>
            <div className="absolute top-0 right-0 group-hover:opacity-100 opacity-0 cursor-pointer text-white bg-orange-600 w-5 h-5 flex items-center justify-center p-0" onClick={() => props.removeToken()}>
                <XMarkIcon />
            </div>
        </div>
    )
}

const OtherTokenSelector = (props: { otherToken?: Token | null, setOtherToken: (token: Token | null) => void }) => {
    return <>
        {props.otherToken
            ? <OtherToken token={props.otherToken} removeToken={() => props.setOtherToken(null)} />
            : <SearchToken setActiveToken={props.setOtherToken} inputClassName="py-2 my-2" />
        }
    </>
}

export const Swap = (props: { activeToken: Token }) => {
    const [otherToken, setOtherToken] = useState<Token | null>()
    const [swapSide, setSwapSide] = useState<SwapSide>(SwapSide.RIGHT)
    const [amount, setAmount] = useState<number>();

    console.log('other token: ',otherToken)

    return (
        <div className="text-slate-200 border-l border-zinc-800 h-full px-3">
            <h2 className="text-xl">Swap</h2>
            <h3>Sell</h3>
            {swapSide === SwapSide.LEFT
                ? <ActiveToken token={props.activeToken} setAmount={setAmount} amount={amount} />
                : <OtherTokenSelector otherToken={otherToken} setOtherToken={setOtherToken} />
            }
            {<div className="flex justify-center text-white text-2xl">
                <MdSwapVert
                    className="hover:cursor-pointer hover:text-orange-600"
                    onClick={() => {
                        swapSide === SwapSide.LEFT
                            ? setSwapSide(SwapSide.RIGHT)
                            : setSwapSide(SwapSide.LEFT)
                    }}
                />
            </div>}
            <h3>Buy</h3>
            {swapSide === SwapSide.RIGHT
                ? <ActiveToken token={props.activeToken} setAmount={setAmount} amount={amount} />
                : <OtherTokenSelector otherToken={otherToken} setOtherToken={setOtherToken} />
            }
        </div>
    )
}