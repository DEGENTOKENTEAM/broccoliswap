import { useAccount, useBalance, useNetwork } from 'wagmi'
import Image from 'next/image'
import { Disclosure } from '@headlessui/react'
import { classNames } from '@/helpers/classNames'
import { ConnectKitButton } from 'connectkit'
import { BridgeTokenStatusWarning } from './SwapHistory/BridgeTokenStatusWarning'
import { getMostRecentTxHistoryItem } from '@/helpers/txHistory'
import { toPrecision } from '@/helpers/number'
import { TokenImage } from './TokenImage'
import { chainFromChainId } from '@/helpers/chain'
import { BiSearch } from 'react-icons/bi'
import { TokenSelector } from './TokenSelector'
import { useState } from 'react'
import { Chain, Token } from '@/types'
import { BsFillGearFill } from 'react-icons/bs'
import { SettingsDialog } from './SettingsDialog'

const navigation = [
    { name: 'Trade', href: '/trade/trade' },
    // { name: 'Portfolio', href: '/portfolio' },
]

const ConnectedButton = () => {
    const { address } = useAccount()
    const { chain } = useNetwork()

    const { data: balanceData } = useBalance({
        address,
        chainId: chain?.id,
    })

    let chainInfo

    try {
        chainInfo = chainFromChainId(chain?.id)
    } catch (e) {
        return <div>Unsupported chain</div>
    }

    return (
        <div className="flex gap-0.5 items-center p-0 -my-2">
            {balanceData && (
                <div className="border-r-2 border-activeblue flex items-center py-1 pr-2 mr-2">
                    {chainInfo && (
                        <TokenImage
                            src={`/chains/${chainInfo.logo}`}
                            symbol={chainInfo.symbol}
                            size={16}
                        />
                    )}
                    {toPrecision(parseFloat(balanceData?.formatted || '0'), 4)}
                </div>
            )}
            <div className="hidden md:inline">
                {address?.slice(0, 6)}...{address?.slice(address.length - 3)}
            </div>
            <div className="md:hidden inline">
                {address?.slice(0, 5)}...{address?.slice(address.length - 2)}
            </div>
        </div>
    )
}

export const Navbar = (props: {
    onClickRecentTrades?: () => void
    proMode: boolean
    setToken: (x: Token) => void
    setProMode: (x: boolean) => void
}) => {
    return (
        <>
            <Disclosure as="nav" className="top-0 w-full flex flex-col">
                {({ open }) => (
                    <>
                        <div className="bg-dark w-full text-center flex justify-center items-center border-b-2 border-activeblue text-xs py-1">
                            Please verify that you&apos;re connected to
                            https://broccoliswap.com
                        </div>
                        <div className="w-full">
                            <div className="flex my-3 flex-grow items-center justify-center sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">
                                    <Image
                                        src="/logo-full.svg"
                                        alt="Swap image"
                                        unoptimized
                                        width="285"
                                        height="50"
                                    />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </Disclosure>
        </>
    )
}
