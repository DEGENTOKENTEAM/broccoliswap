import { Token } from "@/types";
import { TokenImage } from "../TokenImage";
import { TokenImageWithChain } from "../TokenImageWithChain";
import { BsShareFill } from "react-icons/bs";
import { toPrecision } from "@/helpers/number";
import { FaDiscord, FaGithub, FaGlobe, FaInstagram, FaMedium, FaReddit, FaTelegram, FaTiktok, FaYoutube } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import React from "react";
import { linkSync } from "fs";
import { IconType } from "react-icons";

const tokenInfo = {
  "statusCode": 200,
  "data": {
    "decimals": 18,
    "info": {
      "description": "DGNX is a decentralized, governance token of the DegenX ecosystem, it is the token that powers and benefits holders in DegenX ecosystem.",
      "email": "info@dgnx.finance",
      "nftCollection": "https://opensea.io/collection/thedegentrader",
      "ventures": false,
      "extraInfo": "",
      "dextoolsUpdatedAt": "2022-09-06T09:24:05.442Z"
    },
    "links": {
      "discord": "https://discord.com/invite/pyaZqZrS",
      "github": "https://github.com/DEGENTOKENTEAM",
      "instagram": "https://instagram.com/degenecosystem",
      "reddit": "https://www.reddit.com/user/degentrader_sd",
      "telegram": "https://t.me/DegenXportal",
      "tiktok": "https://www.tiktok.com/@degen_traders",
      "twitter": "https://twitter.com/degenecosystem",
      "website": "https://dgnx.finance/",
      "bitbucket": "",
      "facebook": "",
      "linkedin": "",
      "medium": "",
      "youtube": ""
    },
    "locks": [],
    "logo": "avalanche/0x51e48670098173025c477d9aa3f0eff7bf9f7812.png",
    "metrics": {
      "maxSupply": 21000000,
      "totalSupply": 20952608.759589035,
      "holders": 458,
      "txCount": 14855,
      "circulatingSupply": 20952608.759589035
    },
    "name": "DegenX",
    "symbol": "DGNX",
    "totalSupply": "21000000000000000000000000",
    "creationBlock": 19353544,
    "reprPair": {
      "id": {
        "chain": "avalanche",
        "exchange": "traderjoe",
        "pair": "0xbcabb94006400ed84c3699728d6ecbaa06665c89",
        "token": "0x51e48670098173025c477d9aa3f0eff7bf9f7812",
        "tokenRef": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
      },
      "price": 0.2479937115911987
    },
    "audit": {
      "codeVerified": true,
      "date": "2023-11-02T07:08:04.059Z",
      "lockTransactions": false,
      "mint": false,
      "proxy": false,
      "status": "OK",
      "unlimitedFees": false,
      "version": 1,
      "is_contract_renounced": false,
      "provider": "GoPlus"
    },
    "pairs": [
      {
        "address": "0xbcabb94006400ed84c3699728d6ecbaa06665c89",
        "exchange": "traderjoe",
        "dextScore": 99,
        "price": 0.2479937115911987,
        "tokenRef": {
          "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
          "name": "Wrapped AVAX",
          "symbol": "WAVAX"
        }
      },
      {
        "address": "0x4a8323a220d554c03733612d415d465b3f21f12e",
        "exchange": "pangolin",
        "dextScore": 96,
        "price": 0.24935852419087184,
        "tokenRef": {
          "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
          "name": "Wrapped AVAX",
          "symbol": "WAVAX"
        }
      }
    ],
    "chain": "avalanche",
    "address": "0x51e48670098173025c477d9aa3f0eff7bf9f7812"
  }
}

const info = tokenInfo.data;

const SocialLink = (props: { children: any; link: string }) => {
    return (
        <a className="bg-dark rounded-full p-2 border-2 border-activeblue cursor-pointer hover:bg-activeblue" href={props.link} target="_blank" rel="noreferrer">{props.children}</a>
    )
}

export const TokenInfoHeader = (props: { token: Token }) => {
    return (
        <div className=" bg-darkblue border-activeblue border-2 p-5 rounded-xl">
            <div className="flex xl:items-center gap-2 flex-col xl:flex-row">
                <div className="flex gap-2 items-center">
                    <TokenImageWithChain token={props.token} size={48} />
                    <h2 className="font-bold text-xl">{props.token.token.symbol}</h2>
                    <div className="bg-dark text-xs rounded-full p-2 border-2 border-activeblue cursor-pointer hover:bg-activeblue">
                        <BsShareFill />
                    </div>
                    <div className="xl:hidden flex-grow flex justify-end font-bold">
                        ${toPrecision(info.reprPair.price, 5)}
                    </div>
                </div>

                <div className="flex-grow flex xl:justify-center text-xl gap-1">
                    {info.links.website && (<SocialLink link={info.links.website}><FaGlobe /></SocialLink>)}
                    {info.links.discord && (<SocialLink link={info.links.discord}><FaDiscord /></SocialLink>)}
                    {info.links.telegram && (<SocialLink link={info.links.telegram}><FaTelegram /></SocialLink>)}
                    {info.links.twitter && (<SocialLink link={info.links.twitter}><FaXTwitter /></SocialLink>)}
                    {info.links.tiktok && (<SocialLink link={info.links.tiktok}><FaTiktok /></SocialLink>)}
                    {info.links.instagram && (<SocialLink link={info.links.instagram}><FaInstagram /></SocialLink>)}
                    {info.links.github && (<SocialLink link={info.links.github}><FaGithub /></SocialLink>)}
                    {info.links.reddit && (<SocialLink link={info.links.reddit}><FaReddit /></SocialLink>)}
                    {info.links.medium && (<SocialLink link={info.links.medium}><FaMedium /></SocialLink>)}
                    {info.links.youtube && (<SocialLink link={info.links.youtube}><FaYoutube /></SocialLink>)}
                </div>
                <div className="font-bold text-lg hidden xl:block">
                    ${toPrecision(info.reprPair.price, 5)}
                </div>
            </div>
        </div>
    )
};
