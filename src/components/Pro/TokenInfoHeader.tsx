import { EVMToken, chainsInfo } from "@/types";
import { TokenImageWithChain } from "../TokenImageWithChain";
import { BsShareFill } from "react-icons/bs";
import { toPrecision } from "@/helpers/number";
import React, { useMemo, useState } from "react";
import { BiTrendingDown, BiTrendingUp } from "react-icons/bi";
import { classNames } from "@/helpers/classNames";
import { Info, Pair } from "./types";
import { notify } from "@/helpers/errorReporting";
import { Spinner } from "../Spinner";

export const TokenInfoHeader = (props: { token: EVMToken; reprPair?: Pair, info: Info }) => {
    const { reprPair, info } = props;
    const [shared, setShared] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);

    const percentageChange = useMemo(() => {
      if (!reprPair || !reprPair.data?.price || !reprPair.data?.price24h?.price) {
        return 0;
      }
        return reprPair.data.price / reprPair.data.price24h.price;
    }, [reprPair])

    const sharePro = () => {
        if(typeof ClipboardItem && navigator.clipboard.write) {
            // NOTE: Safari locks down the clipboard API to only work when triggered
            //   by a direct user interaction. You can't use it async in a promise.
            //   But! You can wrap the promise in a ClipboardItem, and give that to
            //   the clipboard API.
            //   Found this on https://developer.apple.com/forums/thread/691873
            const inputSymbol = encodeURIComponent(props.token?.token.symbol || '') === props.token?.token.symbol ? props.token?.token.symbol : props.token?.token.address;
            const link = `${inputSymbol}`;
            const text = new ClipboardItem({
                "text/plain": fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/swapLink`, {
                    method: 'post',
                    body: JSON.stringify({
                        inputToken: props.token?.token.address,
                        inputChain: props.token?.chain,
                        link,
                        pro: true,
                    }),
                })
                .then(response => response.json())
                .then(result => {
                    setShareLoading(false);
                    setShared(true);
                    setTimeout(() => setShared(false), 3000);
                    return new Blob([`https://broccoliswap.com/?swap=${result.link}` as string], { type: "text/plain" })
                })
            })
            setShareLoading(true);
            navigator.clipboard.write([text])
        } else {
            notify('Clipboard called with no clipboard access. Implement second API call and click')
        }
    }

    return (
        <div className=" bg-darkblue border-activeblue border-2 p-5 rounded-xl">
            <div className="flex xl:items-center gap-2 flex-col xl:flex-row">
                <div className="flex gap-2 items-center">
                    <TokenImageWithChain token={props.token} size={48} />
                    <h2 className="font-bold text-xl">{props.token.token.symbol}</h2>
                    <div
                        onClick={() => sharePro()}
                        className="bg-dark flex gap-1 items-center text-xs rounded-full p-2 border-2 border-activeblue cursor-pointer hover:bg-activeblue"
                    >
                        {shareLoading ? <Spinner /> : <BsShareFill />}
                        {shared && <span>Copied link</span>}
                    </div>
                    <div className="xl:hidden flex-grow flex items-start justify-end font-bold">
                        {reprPair && reprPair.data?.price24h?.priceChain && <div className="flex flex-col">
                            ${toPrecision(info.data.reprPair.price, 5)}
                            <span className="font-normal text-sm">{toPrecision(reprPair.data.price24h.priceChain, 4)} {chainsInfo[props.token.chain].symbol}</span>
                        </div>}
                        <div className="flex items-center gap-1">
                            <div className={classNames("font-bold", percentageChange > 1 ? 'text-green-500' : 'text-red-500')}>
                                {percentageChange > 1 ? <BiTrendingUp /> : <BiTrendingDown />}
                            </div>
                            <div className={classNames("font-bold", percentageChange > 1 ? 'text-green-500' : 'text-red-500')}>{(percentageChange).toFixed(2)}%</div>
                        </div>
                    </div>
                </div>
                <div className="flex-grow flex xl:justify-center text-xl gap-1" />
                <div className="font-bold text-lg hidden xl:flex items-start gap-1">
                    {reprPair && reprPair.data?.price24h?.priceChain && <div className="flex flex-col">
                        ${toPrecision(info.data.reprPair.price, 5)}
                        <span className="font-normal text-sm">{toPrecision(reprPair.data.price24h.priceChain, 4)} {chainsInfo[props.token.chain].symbol}</span>
                    </div>}
                    <div className="flex items-center gap-1">
                        <div className={classNames("font-bold", percentageChange > 1 ? 'text-green-500' : 'text-red-500')}>
                            {percentageChange > 1 ? <BiTrendingUp /> : <BiTrendingDown />}
                        </div>
                        <div className={classNames("font-bold", percentageChange > 1 ? 'text-green-500' : 'text-red-500')}>{(percentageChange).toFixed(2)}%</div>
                    </div>
                </div>
            </div>
        </div>
    )
};
