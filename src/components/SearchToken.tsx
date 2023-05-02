import { classNames } from "@/helpers/classNames";
import { debounce } from "@/helpers/debounce";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { rubicNetworkToBitqueryNetwork, rubicTokenNetworkToChainId, SearchResult, Token } from "@/types";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { Spinner } from "./Spinner";
import { toPrecision } from "@/helpers/number";

const formatUsd = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 5,
    style: "currency",
    currency: "USD"
})

const fetchTokens = async (filter: string, setSearchResults: Function, includeNative: boolean) => {
    if (filter.length < 3) {
        setSearchResults([])
        return;
    }

    const networks = Object.keys(rubicNetworkToBitqueryNetwork).join(',')

    const result = await fetch(`https://tokens.rubic.exchange/api/v1/tokens?symbol=${filter}&networks=${networks}&pageSize=10`)
    const data = await result.json()
    setSearchResults(data.results)
}

const SearchResultItem = (props: { searchResult: SearchResult, setToken: Function }) => {
    const { address, isConnected } = useAccount()
    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token: props.searchResult.address !== '0x0000000000000000000000000000000000000000' ? props.searchResult.address : undefined,
        chainId: rubicTokenNetworkToChainId[props.searchResult.blockchainNetwork as keyof typeof rubicTokenNetworkToChainId]
    })

    return (
        <li
            className="pb-1 px-1 border-b border-gray-900 cursor-pointer hover:bg-orange-900"
            onClick={() => props.setToken(props.searchResult)}
        >
            <div className="flex items-center">
                <div className="pt-1 font-bold flex items-center pb-1 flex-grow">
                    <Image width="20" height="20" unoptimized alt="Project logo" className="inline mr-2" src={props.searchResult.image} />
                    <div className="flex flex-col">
                        <div className="font-thin">{(rubicNetworkToBitqueryNetwork as any)[props.searchResult.blockchainNetwork]}</div>
                        <div>{props.searchResult.name}</div>
                    </div>
                </div>
                <div className="pr-3 font-bold">
                    <div className="flex flex-col">
                        <div>{props.searchResult.symbol}</div>
                        <div className="font-thin">{props.searchResult.usdPrice && `${formatUsd.format(parseFloat(props.searchResult.usdPrice))}`}</div>
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                <div className="flex-grow">
                    <div className="flex flex-col">
                        {balanceIsLoading && <div className="flex items-center gap-1">
                            <div>Balance:</div>
                            <div><Spinner className="w-3 h-3 m-0 p-0 " /></div>
                        </div>}
                        {!balanceIsLoading && balanceData && balanceData.value.gt(0) && `Balance: ${toPrecision(parseFloat(balanceData.formatted), 4)}`}
                    </div>
                </div>
            </div>
        </li>
    )
}

export const SearchToken = (props: { includeNative: boolean, inputClassName?: string, className?: string, setActiveToken: (token: Token) => void }) => {
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<SearchResult[]>([])
    const componentRef = useRef<HTMLDivElement>(null)

    useOutsideClick(componentRef.current, () => {
        setSearchResults([])
        setSearchQuery('')
    });

    useEffect(() => {
        debouncedFetchTokens(searchQuery, setSearchResults, props.includeNative)
    }, [searchQuery])

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedFetchTokens = useCallback(
        debounce((query: string, setSearchResults: Function, includeNative: boolean) => {
            fetchTokens(query, setSearchResults, includeNative)
        }),
        []
    )

    const setToken = (searchResult: SearchResult) => {
        props.setActiveToken({
            network: searchResult.blockchainNetwork,
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
                        <SearchResultItem
                            key={`${searchResult.name}${searchResult.blockchainNetwork}${searchResult.coingeckoId}`}
                            searchResult={searchResult}
                            setToken={setToken}
                        />
                    ))}
                </ul>
            </div>
        </div>
    )
}
