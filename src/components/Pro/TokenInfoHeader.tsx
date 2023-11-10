import { Token, chainsInfo } from "@/types";
import { TokenImage } from "../TokenImage";
import { TokenImageWithChain } from "../TokenImageWithChain";
import { BsShareFill } from "react-icons/bs";
import { toPrecision } from "@/helpers/number";
import { FaDiscord, FaGithub, FaGlobe, FaInstagram, FaMedium, FaReddit, FaTelegram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import React, { useMemo } from "react";
import { linkSync } from "fs";
import { IconType } from "react-icons";
import { BiTrendingDown, BiTrendingUp } from "react-icons/bi";
import { classNames } from "@/helpers/classNames";
import { Info, Pair } from "./types";

const SocialLink = (props: { children: any; link: string }) => {
    return (
        <a className="bg-dark rounded-full p-2 border-2 border-activeblue cursor-pointer hover:bg-activeblue" href={props.link} target="_blank" rel="noreferrer">{props.children}</a>
    )
}

export const TokenInfoHeader = (props: { token: Token; reprPair?: Pair, info: Info }) => {
    const { reprPair, info } = props;
    const percentageChange = useMemo(() => {
      if (!reprPair || !reprPair.data?.price || !reprPair.data?.price24h?.price) {
        return 0;
      }
        return reprPair.data.price / reprPair.data.price24h.price;
    }, [reprPair])

    return (
        <div className=" bg-darkblue border-activeblue border-2 p-5 rounded-xl">
            <div className="flex xl:items-center gap-2 flex-col xl:flex-row">
                <div className="flex gap-2 items-center">
                    <TokenImageWithChain token={props.token} size={48} />
                    <h2 className="font-bold text-xl">{props.token.token.symbol}</h2>
                    <div className="bg-dark text-xs rounded-full p-2 border-2 border-activeblue cursor-pointer hover:bg-activeblue">
                        <BsShareFill />
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

                <div className="flex-grow flex xl:justify-center text-xl gap-1">
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
