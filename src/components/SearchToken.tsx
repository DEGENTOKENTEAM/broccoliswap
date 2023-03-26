import { classNames } from "@/helpers/classNames";
import { debounce } from "@/helpers/debounce";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { rubicNetworkToBitqueryNetwork, SearchResult, Token } from "@/types";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const formatUsd = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
    style: "currency",
    currency: "USD"
})

const fetchTokens = async (filter: string, setSearchResults: Function) => {
    if (filter.length < 3) {
        setSearchResults([])
        return;
    }

    const networks = Object.keys(rubicNetworkToBitqueryNetwork).join(',')

    const result = await fetch(`https://tokens.rubic.exchange/api/v1/tokens?symbol=${filter}&networks=${networks}&pageSize=10`)
    const data = await result.json()
    setSearchResults(data.results.filter((result: SearchResult) => result.address !== '0x0000000000000000000000000000000000000000'))
}

export const SearchToken = (props: { inputClassName?: string, className?: string, setActiveToken: (token: Token) => void }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const componentRef = useRef<HTMLDivElement>(null)

    useOutsideClick(componentRef.current, () => {
        setSearchResults([])
        setSearchQuery('')
    });

    useEffect(() => {
        debouncedFetchTokens(searchQuery, setSearchResults)
    }, [searchQuery])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetchTokens = useCallback(
        debounce((query: string, setSearchResults: Function) => {
            fetchTokens(query, setSearchResults)
        }),
        []
    )

    const setToken = (searchResult: SearchResult) => {
        props.setActiveToken({
            network: (rubicNetworkToBitqueryNetwork as any)[searchResult.blockchainNetwork],
            address: searchResult.address,
            coingeckoId: searchResult.coingeckoId,
            name: searchResult.name,
            symbol: searchResult.symbol,
            price: searchResult.usdPrice,
            image: searchResult.image,
        })
        setSearchResults([])
        setSearchQuery('')
    }

    return (
        <div className={classNames("relative", props.className)} ref={componentRef}>
            <input
                type="text"
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                placeholder="Search token..."
                className={classNames("w-full border border-gray-800 focus:border-orange-900 p-1 text-xs bg-[#181818] text-gray-400 focus:outline-none", props.inputClassName)}
            />
            <div className="absolute bg-gray-800 w-full text-xs z-50 max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-slate-700">
                <ul>
                    {searchResults.map(searchResult => (
                        <li
                            key={`${searchResult.name}${searchResult.blockchainNetwork}${searchResult.coingeckoId}`}
                            className="pb-1 px-1 border-b border-gray-900 cursor-pointer hover:bg-orange-900"
                            onClick={() => setToken(searchResult)}
                        >
                            <div className="flex items-center">
                                <div className="pt-1 font-bold flex items-center pb-1 flex-grow">
                                    <Image width="20" height="20" unoptimized alt="Project logo" className="inline mr-2" src={searchResult.image} />
                                    {searchResult.name}
                                </div>
                                <div className="pr-3 font-bold">
                                    {searchResult.symbol}
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-grow">
                                    {(rubicNetworkToBitqueryNetwork as any)[searchResult.blockchainNetwork]}
                                </div>
                                <div className="pr-3">
                                    {searchResult.usdPrice && `${formatUsd.format(parseFloat(searchResult.usdPrice))}`}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
