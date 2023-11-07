import { subAddress } from "@/helpers/address";
import { toPrecision } from "@/helpers/number";
import { getTokenTaxes } from "@/helpers/tokenTax";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { Token, chainsInfo } from "@/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaExternalLinkAlt } from "react-icons/fa";

const pairs = [
    {
  "statusCode": 200,
  "data": {
    "creationBlock": 19485712,
    "team": {
      "wallet": "0xbf86bcaf4d396c9927c0b55d9789ecc406309e3b"
    },
    "dextScore": {
      "total": 99
    },
    "metrics": {
      "liquidity": 168662.98688627259,
      "reserve": 339041.1371993715,
      "reserveRef": 7029.228605322847
    },
    "token": {
      "name": "DegenX",
      "symbol": "DGNX",
      "address": "0x51e48670098173025c477d9aa3f0eff7bf9f7812"
    },
    "tokenRef": {
      "name": "Wrapped AVAX",
      "symbol": "WAVAX",
      "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
    },
    "price": 0.2479937115911987,
    "price24h": {
      "volume": 705.0206130323024,
      "swaps": 5,
      "price": 0.2310452870766112,
      "priceChain": 0.021027496374519627,
      "buys": 0,
      "sells": 5,
      "buysVolume": 0,
      "sellsVolume": 705.0206130323024
    },
    "chain": "avalanche",
    "exchange": "traderjoe",
    "address": "0xbcabb94006400ed84c3699728d6ecbaa06665c89"
  }
},
{
  "statusCode": 200,
  "data": {
    "creationBlock": 19485765,
    "team": {
      "wallet": "0xbf86bcaf4d396c9927c0b55d9789ecc406309e3b"
    },
    "dextScore": {
      "total": 96
    },
    "metrics": {
      "liquidity": 131526.6348878304,
      "reserve": 264396.4653171342,
      "reserveRef": 5481.527401971077
    },
    "token": {
      "name": "DegenX",
      "symbol": "DGNX",
      "address": "0x51e48670098173025c477d9aa3f0eff7bf9f7812"
    },
    "tokenRef": {
      "name": "Wrapped AVAX",
      "symbol": "WAVAX",
      "address": "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7"
    },
    "price": 0.24935852419087184,
    "price24h": {
      "volume": 116.76709609676533,
      "swaps": 5,
      "price": 0.22822690069616733,
      "priceChain": 0.020770994239606447,
      "buys": 3,
      "sells": 2,
      "buysVolume": 87.53324717338103,
      "sellsVolume": 29.233848923384315
    },
    "chain": "avalanche",
    "exchange": "pangolin",
    "address": "0x4a8323a220d554c03733612d415d465b3f21f12e"
  }
}
]

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

export const TokenInfo = (props: { token: Token }) => {
    const [tokenTax, setTokenTax] = useState<Awaited<ReturnType<typeof getTokenTaxes>>>()

    const usdLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + pair.data.metrics.liquidity, 0);
    }, [props.token]);

    const tokenLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + pair.data.metrics.reserve, 0);
    }, [props.token]);

    const tokenRefLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + pair.data.metrics.reserveRef, 0);
    }, [props.token]);

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
                <div className="">${toPrecision(info.metrics.totalSupply * info.reprPair.price, 4)}</div>

                <div className="font-bold">Max. supply</div>
                <div className="">{toPrecision(info.metrics.maxSupply, 4)}</div>

                <div className="font-bold">Total supply</div>
                <div className="">{toPrecision(info.metrics.totalSupply, 4)}</div>

                <div className="font-bold">Holders</div>
                <div className="">{toPrecision(info.metrics.holders, 0)}</div>

                <div className="font-bold">TX Count</div>
                <div className="">{toPrecision(info.metrics.txCount, 0)}</div>

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

                <div className="col-span-2 font-bold text-xl">Token taxes</div>
                {tokenTax && <>
                    <div className="font-bold">Buy tax</div>
                    <div className="">{tokenTax.buyTax}%</div>
                </>}

                {tokenTax && <>
                    <div className="font-bold">Sell tax<br /><span className="text-xs font-normal">*Includes DEX fee</span></div>
                    <div className="">{tokenTax.sellTax}%</div>
                </>}
            </div>
        </div>
    )
}