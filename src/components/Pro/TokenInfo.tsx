import { subAddress } from "@/helpers/address";
import { toPrecision } from "@/helpers/number";
import { getTokenTaxes } from "@/helpers/tokenTax";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { Token, chainsInfo } from "@/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { Info, Pair } from "./types";
import { FaGlobe, FaDiscord, FaTelegram, FaTiktok, FaInstagram, FaGithub, FaReddit, FaMedium, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const SocialLink = (props: { children: any; link: string }) => {
    return (
        <a className="bg-dark rounded-full p-2 border-2 border-activeblue cursor-pointer hover:bg-activeblue" href={props.link} target="_blank" rel="noreferrer">{props.children}</a>
    )
}

export const TokenInfo = (props: { token: Token; info: Info, pairs: Pair[] }) => {
    const { info, pairs } = props;
    const [tokenTax, setTokenTax] = useState<Awaited<ReturnType<typeof getTokenTaxes>>>()

    const usdLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + (pair.data.metrics.liquidity ?? 0), 0);
    }, [pairs]);

    const tokenLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + (pair.data.metrics.reserve ?? 0), 0);
    }, [pairs]);

    const tokenRefLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + (pair.data.metrics.reserveRef ?? 0), 0);
    }, [pairs]);

    useAsyncEffect(async () => {
        setTokenTax(await getTokenTaxes(props.token.chain, props.token.token.address));
    }, [props.token]);

    return (
        <div className=" bg-darkblue border-activeblue border-2 p-5 rounded-xl">
            <div className="grid grid-cols-2 gap-1">
                <div className="col-span-2 font-bold text-xl">Token info</div>

                <div className="font-bold">Contract</div>
                <div className="flex items-center"> 
                    <Link
                        href={`${
                            chainsInfo[props.token.chain].explorer
                        }token/${props.token.token.address}`}
                        target="_blank"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1"
                    >
                            {subAddress(props.token.token.address)}{" "}
                            <BiLinkExternal />
                    </Link>
                </div>

                <div className="font-bold">Market cap</div>
                <div className="">${toPrecision(info.data.metrics.totalSupply * info.data.reprPair.price, 4)}</div>

                <div className="font-bold">Max. supply</div>
                <div className="">{toPrecision(info.data.metrics.maxSupply, 6)}</div>

                <div className="font-bold">Total supply</div>
                <div className="">{toPrecision(info.data.metrics.totalSupply, 6)}</div>

                <div className="font-bold">Holders</div>
                <div className="">{toPrecision(info.data.metrics.holders, 0)}</div>

                {info.data.metrics.txCount > 0 ? <>
                    <div className="font-bold">TX Count</div>
                    <div className="">{toPrecision(info.data.metrics.txCount, 0)}</div>
                </> : null}

                <div className="font-bold">
                  Liquidity<br />
                  <span className="text-xs font-normal">
                    {pairs.length === 5 ? 'Top 5 pairs' : `From ${pairs.length} pairs`}
                  </span>
                </div>
                <div className="">
                    ${toPrecision(usdLiquidity, 4)}<br />
                    {toPrecision(tokenLiquidity, 4)} {pairs[0].data.token.symbol}<br />
                    {toPrecision(tokenRefLiquidity, 4)} {pairs[0].data.tokenRef.symbol}
                </div>

                {tokenTax && tokenTax.buyTax !== -1 && tokenTax.sellTax !== -1 && <>
                    <div className="col-span-2 font-bold text-xl">Token taxes</div>
                    <div className="font-bold">Buy tax</div>
                    <div className="">{tokenTax.buyTax}%</div>

                    <div className="font-bold">Sell tax<br /><span className="text-xs font-normal">*Includes DEX fee</span></div>
                    <div className="">{tokenTax.sellTax}%</div>
                </>}
            </div>
            <div className="flex xl:justify-center text-xl gap-1 flex-wrap mt-5">
                {info.data.links.website && (<SocialLink link={info.data.links.website}><FaGlobe /></SocialLink>)}
                {info.data.links.discord && (<SocialLink link={info.data.links.discord}><FaDiscord /></SocialLink>)}
                {info.data.links.telegram && (<SocialLink link={info.data.links.telegram}><FaTelegram /></SocialLink>)}
                {info.data.links.twitter && (<SocialLink link={info.data.links.twitter}><FaXTwitter /></SocialLink>)}
                {info.data.links.tiktok && (<SocialLink link={info.data.links.tiktok}><FaTiktok /></SocialLink>)}
                {info.data.links.instagram && (<SocialLink link={info.data.links.instagram}><FaInstagram /></SocialLink>)}
                {info.data.links.github && (<SocialLink link={info.data.links.github}><FaGithub /></SocialLink>)}
                {info.data.links.reddit && (<SocialLink link={info.data.links.reddit}><FaReddit /></SocialLink>)}
                {info.data.links.medium && (<SocialLink link={info.data.links.medium}><FaMedium /></SocialLink>)}
                {info.data.links.youtube && (<SocialLink link={info.data.links.youtube}><FaYoutube /></SocialLink>)}
            </div>
        </div>
    )
}