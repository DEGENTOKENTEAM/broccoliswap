import { getTokenInfo } from "@/helpers/coingecko";
import { Token } from "@/types"
import { useEffect, useState } from "react"

type TokenInfo = {
    name: string;
    description: { en: string }
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

export const TokenHeader = (props: { token: Token }) => {
    const [info, setInfo] = useState<TokenInfo>()

    useEffect(() => {
        getTokenInfo(props.token.coingeckoId).then(setInfo)
    }, [props.token.coingeckoId])

    if (!info) {
        return null;
    }

    return (
        <div className="flex flex-col items-start h-full py-1 pl-3 text-slate-200">
            <div className="flex w-full items-center">
                <h1 className="text-xl flex-grow">{info.name}</h1>
                contract address, 24h volume, market cap below name
                <div className="flex">socials here</div>

            </div>
        </div>
    )
}