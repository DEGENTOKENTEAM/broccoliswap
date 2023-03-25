import { classNames } from "@/helpers/classNames";
import { getTokenInfo } from "@/helpers/coingecko";
import { explorersPerChain } from "@/helpers/variables";
import { Token } from "@/types"
import { useEffect, useRef, useState } from "react"
import { RiFileCopyFill, RiShareForward2Fill } from "react-icons/ri"
import { FaTelegramPlane, FaTwitter, FaGlobe, FaDiscord } from "react-icons/fa"
import Image from "next/image";

type TokenInfo = {
    name: string;
    contract_address?: string;
    description: { en: string };
    image: {
        small: string;
        medium: string;
        large: string;
    }
    market_data: {
        fully_diluted_valuation: {
            usd: number
        }
        total_volume: {
            usd: number
        }
        market_cap?: {
            usd?: number
        }
    }
    links: {
        homepage: string[]
        blockchain_site: string[]
        official_forum_url: string[]
        chat_url: string[]
        twitter_screen_name: string;
        telegram_channel_identifier: string
        repos_url: {
            github: string[]
            bitbucket: string[]
        }
    }
}

const CopyableContractAddress = (props: { address: string, network: string }) => {
    const [spanCopiedVisible, setSpanCopiedVisible] = useState(false)
    const copyAddress = () => {
        navigator.clipboard.writeText(props.address);
        setSpanCopiedVisible(true)
        setTimeout(() => setSpanCopiedVisible(false), 1000)
    }

    return <>
        <span>Contract address: {props.address.substring(0, 5)}...{props.address.substring(props.address.length - 3)}</span>
        <RiFileCopyFill className="inline ml-1 cursor-pointer -mt-1" onClick={copyAddress} />
        <a href={`${(explorersPerChain as any)[props.network]}/token/${props.address}`} target="_blank" rel="noreferrer">
            <RiShareForward2Fill className="inline ml-1 cursor-pointer -mt-1" onClick={copyAddress} />
        </a>
        <span className={classNames('ml-1', spanCopiedVisible ? 'opacity-1' : 'opacity-0')}>Copied!</span>
    </>
}

const MarketcapDisplay = (props: { marketCap: number }) => {
    const marketCap = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        style: "currency",
        currency: "USD"
    }).format(
        props.marketCap,
    );
    return <span>Market cap: {marketCap}</span>
}

const Volume24H = (props: { volume: number }) => {
    const volume = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        style: "currency",
        currency: "USD"
    }).format(
        props.volume,
    );
    return <span>24h volume: {volume}</span>
}

export const TokenHeader = (props: { token: Token }) => {
    const [info, setInfo] = useState<TokenInfo>()

    useEffect(() => {
        getTokenInfo(props.token.coingeckoId).then(setInfo)
    }, [props.token.coingeckoId])
console.log(info)
    if (!info) {
        return null;
    }

    return (
        <div className="flex flex-col items-start h-full py-1 pl-3 text-slate-200">
            <div className="flex w-full items-start">
                <div className="flex-grow">
                    <div className="flex items-center">
                        <Image width="20" height="20" unoptimized alt="Project logo" className="inline mr-2" src={info.image.small} />
                        <h1 className="text-xl inline">{info.name}</h1>
                    </div>
                    <span className="text-xs">
                        <MarketcapDisplay marketCap={info.market_data.market_cap?.usd || info.market_data.fully_diluted_valuation.usd} />
                        <span className="mx-2">|</span>
                        <Volume24H volume={info.market_data.total_volume.usd} />
                        <span className="mx-2">|</span>
                        Chain: {props.token.network}
                        {info.contract_address  && (<>
                            <span className="mx-2">|</span>
                            <CopyableContractAddress address={info.contract_address} network={props.token.network} />
                        </>)}
                    </span>
                </div>
                <div className="flex mt-1 text-xl">
                    {info.links.homepage.find(page => !!page) && <a className="px-1.5" href={`${info.links.homepage.find(page => !!page)}`} target="_blank" rel="noreferrer">
                        <FaGlobe className="text-orange-500 hover:text-orange-600" />
                    </a>}
                    {info.links.twitter_screen_name && <a className="px-1.5" href={`https://twitter.com/${info.links.twitter_screen_name}`} target="_blank" rel="noreferrer">
                        <FaTwitter className="text-orange-500 hover:text-orange-600" />
                    </a>}
                    {info.links.telegram_channel_identifier && <a className="px-1.5" href={`https://t.me/${info.links.telegram_channel_identifier}`} target="_blank" rel="noreferrer">
                        <FaTelegramPlane className="text-orange-500 hover:text-orange-600" />
                    </a>}
                    {info.links.chat_url.find((url) => url.includes('//discord.com')) && <a className="px-1.5" href={info.links.chat_url.find((url) => url.includes('//discord.com'))} target="_blank" rel="noreferrer">
                        <FaDiscord className="text-orange-500 hover:text-orange-600" />
                    </a>}
                </div>

            </div>
        </div>
    )
}