import { blockchainNameToChain, blockchainNameToChainID, chainFromChainId } from "@/helpers/chain";
import { putHistory } from "@/helpers/txHistory";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { Chain, NULL_ADDRESS, EVMToken, chainsInfo } from "@/types";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { useState } from "react";
import { CrossChainTrade, OnChainTrade, UserRejectError, LowGasError, RubicSdkError } from "rubic-sdk";
import {
    useAccount,
    useBalance,
    useConnect,
    useNetwork,
    useSwitchNetwork,
    useWaitForTransaction
} from "wagmi";
import { notify, reportError } from "../../helpers/errorReporting";
import { getErrorName } from "@/helpers/error";
import { trackSwap } from "@/helpers/track";
import { getSDK } from "@/helpers/rubic";
import { getGas } from "@/helpers/gas";
import Button from "./Button";

const tradeStatusToButtonStatus = (
    isConnected: boolean,
    chain: ReturnType<typeof useNetwork>["chain"],
    tradeLoading: boolean,
    trades?: OnChainTrade[] | (CrossChainTrade | null)[] | string,
    inputChain?: Chain,
    outputChain?: Chain,
    inputAmountInUsd?: number
) => {
    if (tradeLoading) {
        return { text: "Calculating route...", disabled: true };
    }

    if (chain && inputChain && isConnected && chainFromChainId(chain?.id)?.chain !== inputChain) {
        return {
            disabled: false,
            buttonType: "switchNetworkButton",
            targetChainId: chainsInfo[inputChain].id
        };
    }
    
    if (!trades || trades.length === 0) {
        return { text: "Select route", disabled: true };
    }
    
    const trade = trades[0];

    if (inputChain !== outputChain && inputAmountInUsd && inputAmountInUsd < 5) {
        return { text: "Please bridge at least $5", disabled: true };
    }

    if (trades === "No trades available") {
        return { text: "No trades available", disabled: true };
    }

    if (typeof trades === 'string' || typeof trade === 'string') {
        return { text: "Something went wrong", disabled: true };
    }

    if (!isConnected) {
        return {
            disabled: false,
            buttonType: "connectButton"
        };
    }

    if (chainFromChainId(chain?.id)?.rubicSdkChainName !== trade?.from.blockchain) {
        return {
            disabled: false,
            buttonType: "switchNetworkButton",
            targetChainId: blockchainNameToChainID(trade?.from.blockchain)
        };
    }

    return { text: "Swap", disabled: false, trades: trades as (OnChainTrade[] | CrossChainTrade[]) };
};

export const SwitchNetworkButton = (props: { targetChainId?: number }) => {
    const { isLoading, switchNetwork } = useSwitchNetwork();
    return (
        <Button
            onClick={() => switchNetwork?.(props.targetChainId)}
            active={!isLoading}
            disabled={isLoading}
            animating={isLoading}
        >
            Switch Network
        </Button>
    );
};

const MaybeSwapButton = (props:{
    trades: OnChainTrade[] | CrossChainTrade[],
    onSwapDone?: (tx: string, swapInputChain: Chain, swapOutputChain: Chain, swapInputToken: EVMToken, swapOutputToken: EVMToken) => void ,
    inputToken?: EVMToken,
    outputToken?: EVMToken,
    inputTokenSellTax?: number
}) => {
    const { address } = useAccount();

    const sdk = getSDK();
    
    const [approveTxHash, setApproveTxHash] = useState('')
    const [isSwapping, setIsSwapping] = useState(false)
    const [swapError, setSwapError] = useState<any>()
    const [swapErrorMessage, setSwapErrorMessage] = useState<any>()
    const [showRefreshButton, setShowRefreshButton] = useState(false);
    const [buttonAction, setButtonAction] = useState<{ text: string, action: Function } | undefined>()

    const referenceTrade = props.trades[0];

    const { isLoading: balanceIsLoading, data: balanceData } = useBalance({
        address,
        token:
            (referenceTrade as OnChainTrade | CrossChainTrade | undefined)?.from
                ?.address !== NULL_ADDRESS
                ? (referenceTrade as OnChainTrade | CrossChainTrade | undefined)
                      ?.from?.address as `0x${string}`
                : undefined,
        chainId: blockchainNameToChainID(referenceTrade?.from.blockchain)
    });

    const { data: approveTxLoaded, isLoading: approveTxLoading } = useWaitForTransaction({
        hash: approveTxHash as `0x${string}`,
    })

    const doSwap = async (tradeIterator = 0): Promise<void> => {
        const currentTrade = props.trades[tradeIterator];
        setIsSwapping(true);
        try {
            const gas = await getGas(blockchainNameToChain(currentTrade.from.blockchain)!.chain)
            console.log(await currentTrade.needApprove())
            if (await currentTrade.needApprove()) {
                await currentTrade.approve({});
            }
            const tx = await currentTrade.swap({
                gasPriceOptions: parseInt(gas.gasPrice || gas.baseFee || '0') > 0 ? gas : undefined,
            });
            setIsSwapping(false);

            if (!currentTrade) {
                throw Error('No valid trades');
            }

            const data = {
                swapTx: tx,
                fromChain: blockchainNameToChain(currentTrade.from.blockchain)!.chain,
                toChain: blockchainNameToChain(currentTrade.to.blockchain)!.chain,
                fromSymbol: currentTrade.from.symbol,
                fromAddress: currentTrade.from.address,
                fromLogo: props.inputToken?.token.image || '',
                toSymbol: currentTrade.to.symbol,
                toAddress: currentTrade.to.address,
                fromAmount: currentTrade.from.tokenAmount.toNumber(),
                toAmount: currentTrade.to.tokenAmount.toNumber(),
                toLogo: props.outputToken?.token.image || '',
            }
            
            // @ts-expect-error typeguard for cross chain trades
            if (currentTrade?.bridgeType) {
                // @ts-expect-error typeguard for cross chain trades
                data.bridge = currentTrade.type
                // @ts-expect-error typeguard for cross chain trades
                data.bridgeId = currentTrade.id
                // @ts-expect-error typeguard for cross chain trades
                data.bridgeType = currentTrade.bridgeType
            }

            putHistory(data);

            await trackSwap({
                address: address!,
                inputToken: currentTrade.from.symbol,
                inputTokenAddress: currentTrade.from.address,
                inputChain: currentTrade.from.blockchain,

                outputToken: currentTrade.to.symbol,
                outputTokenAddress: currentTrade.to.address,
                outputChain: currentTrade.to.blockchain,

                amountIn: currentTrade.from.tokenAmount.toNumber(),
                amountInUsd: currentTrade.from.tokenAmount.toNumber() * parseFloat(props.inputToken?.token.usdPrice || '0'),
                amountOut: currentTrade.to.tokenAmount.toNumber(),
                amountOutUsd: currentTrade.to.tokenAmount.toNumber() * parseFloat(props.outputToken?.token.usdPrice || '0'),

                revenue: (currentTrade.feeInfo.rubicProxy?.platformFee?.percent || 0) > 0
                    ? currentTrade.from.tokenAmount.toNumber() * 0.00125
                    : 0,
                revenueInUsd: (currentTrade.feeInfo.rubicProxy?.platformFee?.percent || 0) > 0
                    ? currentTrade.from.tokenAmount.toNumber() * parseFloat(props.inputToken?.token.usdPrice || '0') * 0.00125
                    : 0,
            })

            props.onSwapDone?.(
                tx,
                blockchainNameToChain(currentTrade.from.blockchain)!.chain,
                blockchainNameToChain(currentTrade.to.blockchain)!.chain,
                props.inputToken!,
                props.outputToken!
            );
        } catch (e: any) {
            if (e instanceof UserRejectError
                || (e instanceof RubicSdkError && e.message.toLowerCase() === 'the transaction was cancelled')) {
                setIsSwapping(false);
                return;
            }

            console.log('message::::', e.message)

            if (e?.message.includes('err: insufficient funds for gas * price + value:')) {
                setIsSwapping(false);
                setSwapError(e);
                setSwapErrorMessage(`You do not have enough ${chainsInfo[props.inputToken!.chain].nativeTokenSymbol} to execute this trade`);
                return;
            }

            if (e?.message.toLowerCase().includes('no working rpc') || e?.message.toLowerCase().includes('provider is not ready')) {
                setIsSwapping(false);
                setSwapError(e);
                setSwapErrorMessage(`Your RPC is not loaded or rate limited. Please wait around a minute, refresh and try again`);
                return;
            }

            // Try another trade if possible
            if (props.trades[tradeIterator + 1]) {
                return doSwap(tradeIterator + 1)
            }

            if (e?.message.includes('Not allowed') || e?.message.toLowerCase().includes('anti mev')) {
                setIsSwapping(false);
                setSwapError(e);
                if (props.inputToken && props.inputToken.chain !== props.outputToken?.chain) {
                    setSwapErrorMessage(`The input token does not support our contract to sell. Please first swap to ${chainsInfo[props.inputToken.chain].symbol} and then bridge.`);
                } else {
                    setSwapErrorMessage(`The input token does not support our contract to sell. Please try to swap directly using the DEX where the liquidity is hosted.`);
                }
                return;
            }

            if (e?.message.includes('matching key. keychain')) {
                setIsSwapping(false);
                setSwapError(e);
                setSwapErrorMessage(`Your wallet connection with broccoliswap isn't working correctly. Please click on the button below to reset and refresh`);
                setShowRefreshButton(true);
                return;
            }

            if (e instanceof RubicSdkError) {
                setSwapError(e);
                setSwapErrorMessage(`Some error occured. Please wait a bit and try again. If the issue persists, open a support ticket on Discord. Full error: ${e.message}`);
                setIsSwapping(false);
                return;
            }

            setSwapError(e)
            setIsSwapping(false);
        }
    }

    useAsyncEffect(async () => {
        setButtonAction(undefined)

        const referenceTrade = props.trades[0];
        if (!referenceTrade) {
            return;
        }
        
        setButtonAction({
            text: 'Swap',
            action: doSwap
        })
    }, [props.trades, approveTxLoaded])

    if (showRefreshButton) {
        return (
            <>
                <Button
                    active
                    onClick={() => {
                        localStorage.clear();
                        window.location.assign(`?inputChain=${props.inputToken?.chain}&inputToken=${props.inputToken?.token.address}&outputChain=${props.outputToken?.chain}&outputToken=${props.outputToken?.token.address}&amount=${props.trades?.[0]?.from?.tokenAmount?.toNumber()}`)
                    }}
                >
                    Reload app
                </Button>
                <div className="bg-dark border-2 border-error p-3 rounded-xl text-light-200 flex flex-col gap-3">
                    {swapErrorMessage ? <div>{swapErrorMessage}</div> : <div>We could not execute your swap because of an error. Please refresh trade and try again.</div>}
                </div>
            </>
        )
    }

    if (swapError) {
        notify(swapError, (event) => {
            event.addMetadata('errorInfo', {
                name: getErrorName(swapError),
                message: swapError instanceof RubicSdkError ? swapError.message : '',
                object: JSON.stringify(swapError),
            });
        })

        const tradeAmount = props.trades?.[0]?.from?.tokenAmount?.toNumber() * parseFloat(props.inputToken?.token.usdPrice || '0');
        return (
            <>
                <Button disabled>
                    Something went wrong.
                </Button>
                <div className="bg-dark border-2 border-error p-3 rounded-xl text-light-200 flex flex-col gap-3">
                    {swapErrorMessage ? <div>{swapErrorMessage}</div> : <div>We could not execute your swap because of an error. Please refresh trade and try again.</div>}
                </div>
            </>
        )
    }

    if (balanceIsLoading) {
        return <Button disabled animating>Loading balance</Button>;
    }

    if (approveTxLoading) {
        return <Button disabled animating>Approving...</Button>
    }

    if (isSwapping) {
        return <Button disabled animating>Executing swap...</Button>
    }

    if (balanceData && props.trades[0].from.tokenAmount.toNumber() > parseFloat(balanceData.formatted)) {
        return <Button disabled>Balance too low</Button>
    }

    if (buttonAction) {
        return <Button active onClick={buttonAction.action}>{buttonAction.text}</Button>
    }
    

    return null;
}

export const SwapButton = (props: {
    tradeLoading: boolean;
    trades?: OnChainTrade[] | (CrossChainTrade | null)[] | string;
    onSwapDone?: (tx: string, swapInputChain: Chain, swapOutputChain: Chain, swapInputToken: EVMToken, swapOutputToken: EVMToken) => void;
    inputToken?: EVMToken,
    outputToken?: EVMToken,
    inputTokenSellTax?: number,
    inputAmountInUsd?: number,
    inputAmount?: number
}) => {
    const { isConnected } = useAccount();
    const { chain } = useNetwork();

    const buttonStatus = tradeStatusToButtonStatus(
        isConnected,
        chain,
        props.tradeLoading,
        props.trades,
        props.inputToken?.chain,
        props.outputToken?.chain,
        props.inputAmountInUsd
    );

    if (buttonStatus.buttonType === "connectButton") {
        return (
            <ConnectKitButton.Custom>
                {({ isConnected, show, address }) => {
                    return (
                        <Button
                            onClick={show}
                            active
                        >
                            Connect Wallet
                        </Button>
                    );
                }}
            </ConnectKitButton.Custom>
        );
    }

    if (buttonStatus.buttonType === "switchNetworkButton") {
        return (
            <SwitchNetworkButton targetChainId={buttonStatus.targetChainId} />
        );
    }

    if (buttonStatus.disabled) {
        return <Button disabled animating={props.tradeLoading}>
            {buttonStatus?.text}
        </Button>
    }

    if (buttonStatus.trades) {
        return (
            <MaybeSwapButton
                inputToken={props.inputToken}
                outputToken={props.outputToken}
                trades={buttonStatus.trades}
                onSwapDone={props.onSwapDone}
                inputTokenSellTax={props.inputTokenSellTax}
            />
        );
    }

    return null;
};
