import { debounce } from "@/helpers/debounce";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type SearchResult = {
    address: string;
    name: string;
    symbol: string;
    blockchainNetwork: string;
    decimals: number
    image: string;
    rank: number;
    usedInIframe: boolean;
    coingeckoId?: string;
    usdPrice?: string,
    token_security: null
};

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

    const result = await fetch(`https://tokens.rubic.exchange/api/v1/tokens?symbol=${filter}&pageSize=10`)
    const data = await result.json()
    setSearchResults(data.results)
}

export const SearchToken = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])

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

    return (
        <div className="relative w-32 md:w-64 lg:w-96">
            <input
                type="text"
                onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                placeholder="Search token..."
                className="w-full border border-gray-800 focus:border-orange-900 p-1 text-xs bg-[#181818] text-gray-400 focus:outline-none"
            />
            <div className="absolute bg-gray-800 w-full text-xs z-50 max-h-64 overflow-auto scrollbar-thin scrollbar-thumb-orange-500 scrollbar-track-slate-700">
                <ul>
                    {searchResults.map(searchResult => (
                        <li key={searchResult.name} className="pb-1 px-1 border-b border-gray-900 cursor-pointer hover:bg-orange-900">
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
                                    {searchResult.blockchainNetwork}
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
