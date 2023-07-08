import { blockchainToRubicTokenNetwork, rubicNetworkToWagmiNetworkId, rubicTokenNetworkToChainId, wagmiNetworkIdToRubicNetwork } from "@/__old__types";
import { CrossChainTrade, OnChainTrade } from "rubic-sdk"
import { useAccount, useBalance, useConnect, useNetwork, useSwitchNetwork } from "wagmi"
import { IoMdClose } from "react-icons/io"
import { InjectedConnector } from "wagmi/connectors/injected";
import { Spinner } from "../Spinner";
import BigNumber from "bignumber.js";
import { useState } from "react";
import { waitForTransaction } from "@wagmi/core";
import { classNames } from "@/helpers/classNames";

const SwitchNetworkButton = (props: { targetChainId: number }) => {
    const { isLoading, pendingChainId, switchNetwork } = useSwitchNetwork()
    console.log(props.targetChainId)

    return (
        <>
            <button onClick={() => switchNetwork?.(props.targetChainId)} className="bg-orange-600 py-2 mt-2 px-3 mx-auto hover:bg-orange-700">
                Switch chain {isLoading && ' (switching)'}
            </button>
        </>
    )
}

export const SwapButton = (
    props: {
        trade: OnChainTrade | CrossChainTrade
    }
) => {
    const [needApprove, setNeedApprove] = useState<boolean | null>(null)
    const [approveTxLoading, setApproveTxLoading] = useState(false)
    const [swapTxError, setSwapTxError] = useState('')
    const [swapTx, setSwapTx] = useState('')
    const [swapping, setSwapping] = useState(false)
    const { isConnected, address } = useAccount();
    const { connect } = useConnect({ connector: new InjectedConnector() })
    const { chain } = useNetwork()
    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token: props.trade.from.address !== '0x0000000000000000000000000000000000000000' ? props.trade.from.address as `0x${string}` : undefined,
        chainId: rubicTokenNetworkToChainId[props.trade.from.blockchain as keyof typeof rubicTokenNetworkToChainId]
    })

    if (needApprove === null) {
        props.trade.needApprove().then(setNeedApprove)
    }

    const waitUntilTransactionApproved = async (hash: string) => {
        setApproveTxLoading(true);
        // Wait until the tx is approved
        await waitForTransaction({
            hash: hash as `0x${string}`,
            chainId: rubicTokenNetworkToChainId[props.trade.from.blockchain as keyof typeof rubicTokenNetworkToChainId]
        })

        // Wait another sec to be sure
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Check again the needApprove function
        const needApprove = await props.trade.needApprove()
        setNeedApprove(needApprove)
        setApproveTxLoading(false)
    }

    const waitUntilSwapTxDone = async (hash: string) => {
        console.log(hash)
    }

    const trySwap = async () => {
        setSwapping(true);
        try {
            const tx = await props.trade.swap()
            setSwapTx(tx)
            setSwapping(false);
        } catch (e: any) {
            console.log(e)
            setSwapTxError(e.message || 'Error received from LP')
            setSwapping(false);
        }
    }

    // Check connected
    if (!isConnected || !chain) {
        return ( 
            <button onClick={() => connect()} className="bg-orange-600 py-2 mt-2 px-3 mx-auto hover:bg-orange-700">
                Connect wallet
            </button>
        )
    }

    // Check if the connected chain is correct
    const blockchain = wagmiNetworkIdToRubicNetwork[chain.id as keyof typeof wagmiNetworkIdToRubicNetwork];
    if (blockchain !== props.trade.from.blockchain) {
        return (
            <SwitchNetworkButton targetChainId={rubicNetworkToWagmiNetworkId[props.trade.from.blockchain as keyof typeof rubicNetworkToWagmiNetworkId]} />
        )
    }

    // Check if the balance is enough
    if (balanceIsLoading) {
        return <Spinner />
    }

    if (balanceData && new BigNumber(balanceData.value.toString()).lt(new BigNumber(props.trade.from.tokenAmount.times(new BigNumber(10).pow(props.trade.from.decimals))))) {
        return <button disabled className="bg-orange-600 py-2 mt-2 px-3 mx-auto disabled disabled:bg-orange-900">
            Not enough balance
        </button>
    }

    // Check if we need to approve. If not we can swap, otherwise we need to do an approve tx
    if (needApprove === null) {
        return <Spinner />
    } else if (needApprove === true && !approveTxLoading) {
        return <button onClick={() => props.trade.approve({ onTransactionHash: hash => waitUntilTransactionApproved(hash) })} className="bg-orange-600 py-2 mt-2 px-3 mx-auto hover:bg-orange-700">
            Approve
        </button>
    } else if (approveTxLoading) {
        return <button className="bg-orange-900 py-2 mt-2 px-3 mx-auto disabled disabled:bg-orange-900">
            <div className="flex items-center gap-1">
                Approving
                <Spinner />
            </div>
        </button>
    }

    return (
        <>
            <button disabled={swapping} onClick={() => trySwap()} className={classNames("bg-orange-600 py-2 mt-2 px-3 mx-auto hover:bg-orange-700", swapping && 'disabled disabled:bg-orange-900 disabled:hover:bg-orange-900')}>
                <div className="flex items-center gap-1">
                    Swap
                    {swapping && <Spinner />}
                </div>
            </button>
            {swapTxError && <div className="relative bg-red-900 border border-red-400 p-3 my-2 text-sm">
                <div className="flex-col flex items-start gap-2">
                    <div className="flex">
                        <div className="flex-grow">Could not execute swap, does the slippage include the token tax?</div>
                        <IoMdClose className="cursor-pointer hover:text-orange-600" onClick={() => setSwapTxError('')} />
                    </div>
                    <p className="text-xs">{swapTxError}</p>
                </div>
            </div>}
            {swapTx && <div className="relative bg-green-900 border border-green-400 p-3 my-2 text-sm">
                <div className="flex-col flex items-start gap-2">
                    <div className="flex w-full">
                        <div className="flex-grow">
                            {props.trade.from.blockchain === props.trade.to.blockchain
                                ? 'Swap successful!'
                                : 'Cross-chain swap initiated. Please wait a few minutes for the bridge to complete transfer'
                            }
                        </div>
                        <IoMdClose className="cursor-pointer hover:text-green-600" onClick={() => setSwapTx('')} />
                    </div>
                    {/* <a
                        target="_blank"
                        rel="noreferrer"
                        className="underline text-xs"
                        href={`${explorersPerChain[blockchainToRubicTokenNetwork[props.trade.from.blockchain as keyof typeof blockchainToRubicTokenNetwork] as keyof typeof explorersPerChain]}tx/${swapTx}`}>
                            View
                    </a> */}
                </div>
            </div>}
        </>
    )
}