import BigNumber from "bignumber.js";
import { fromIntString, toIntString, toPrecision } from "./number";
import { ethers } from "ethers";
import { chainFromChainId } from "./chain";

type CelerEstimationApiResult = {
    base_fee: string;
    brdige_rate: number;
    drop_gas_amt: string;
    eq_value_token_amt: string;
    err: string | null;
    estimated_receive_amt: string;
    max_slippage: number;
    op_fee_rebate: number;
    op_fee_rebate_end_time: string;
    op_fee_rebate_portion: number;
    perc_fee: string;
    slippage_tolerance: number;
}

export const bridgeConfigs = [
    {
        "org_chain_id": 43114,
        "org_token": {
            "token": {
                "symbol": "DGNX",
                "address": "0x51e48670098173025C477D9AA3f0efF7BF9f7812",
                "decimal": 18,
                "xfer_disabled": false
            },
            "name": "DGNX",
            "icon": "https://i.postimg.cc/cLK43csy/DGNX.png",
            "inbound_lmt": "",
            "inbound_epoch_cap": "",
            "transfer_disabled": false,
            "liq_add_disabled": false,
            "liq_rm_disabled": false,
            "liq_agg_rm_src_disabled": false,
            "delay_threshold": "",
            "delay_period": 0
        },
        "pegged_chain_id": 1,
        "pegged_token": {
            "token": {
                "symbol": "DGNX",
                "address": "0x0000000000300dd8B0230efcfEf136eCdF6ABCDE",
                "decimal": 18,
                "xfer_disabled": false
            },
            "name": "DGNX",
            "icon": "https://i.postimg.cc/cLK43csy/DGNX.png",
            "inbound_lmt": "",
            "inbound_epoch_cap": "",
            "transfer_disabled": false,
            "liq_add_disabled": false,
            "liq_rm_disabled": false,
            "liq_agg_rm_src_disabled": false,
            "delay_threshold": "",
            "delay_period": 0
        },
        "pegged_deposit_contract_addr": "0xb51541df05DE07be38dcfc4a80c05389A54502BB",
        "pegged_burn_contract_addr": "0x52E4f244f380f8fA51816c8a10A63105dd4De084",
        "canonical_token_contract_addr": "",
        "vault_version": 2,
        "bridge_version": 2,
        "migration_peg_burn_contract_addr": ""
    },
    {
        "org_chain_id": 56,
        "org_token": {
            "token": {
                "symbol": "AI",
                "address": "0xA9b038285F43cD6fE9E16B4C80B4B9bCcd3C161b" as const,
                "decimal": 18,
                "xfer_disabled": false
            },
            "name": "Flourishing AI",
            "icon": "https://i.postimg.cc/vTzMmCVW/AI.png",
            "inbound_lmt": "",
            "inbound_epoch_cap": "",
            "transfer_disabled": false,
            "liq_add_disabled": false,
            "liq_rm_disabled": false,
            "liq_agg_rm_src_disabled": false,
            "delay_threshold": "",
            "delay_period": 0
        },
        "pegged_chain_id": 43114,
        "pegged_token": {
            "token": {
                "symbol": "AI",
                "address": "0x10B3AAF66D90Cb54fca62Dd37d17022555399EE1",
                "decimal": 18,
                "xfer_disabled": false
            },
            "name": "Flourishing AI",
            "icon": "https://i.postimg.cc/vTzMmCVW/AI.png",
            "inbound_lmt": "",
            "inbound_epoch_cap": "",
            "transfer_disabled": false,
            "liq_add_disabled": false,
            "liq_rm_disabled": false,
            "liq_agg_rm_src_disabled": false,
            "delay_threshold": "",
            "delay_period": 0
        },
        "pegged_deposit_contract_addr": "0x11a0c9270D88C99e221360BCA50c2f6Fda44A980",
        "pegged_burn_contract_addr": "0xb774C6f82d1d5dBD36894762330809e512feD195",
        "canonical_token_contract_addr": "",
        "vault_version": 2,
        "bridge_version": 2,
        "migration_peg_burn_contract_addr": ""
    },
] as const;

export const getEstimation = async (
    srcChain: number,
    dstChain: number,
    tokenSymbol: string,
    amount: number,
    decimals: number,
    slippage: number
) => {
    const slippageInt = (slippage * 1e6 / 100).toString();
    console.log('s', slippageInt)
    const amountInt = toIntString(amount, decimals);
    const response = await fetch(`https://cbridge-prod2.celer.app/v2/estimateAmt?src_chain_id=${srcChain}&dst_chain_id=${dstChain}&token_symbol=${tokenSymbol}&amt=${amountInt}&slippage_tolerance=${slippageInt}&usr_addr=&is_pegged=true`);
    const result: CelerEstimationApiResult = await response.json();

    if (result.err) {
        throw Error('Celer estimation error ');
    }

    const estimatedReceiveAmount = new BigNumber(result.estimated_receive_amt);
    const baseFee = new BigNumber(result.base_fee).div(Math.pow(10, decimals));

    // Bridge at least so much so you get more than 0 tokens and bridge twice the base fee.
    if (estimatedReceiveAmount.lt(0) || new BigNumber(amountInt).lt(new BigNumber(result.base_fee).multipliedBy(2))) {
        throw Error(`Bridge amount below minimum threshold. Please bridge at least ${toPrecision(baseFee.multipliedBy(2).toNumber(), 4)} ${tokenSymbol}.`);
    }

    return {
        estimatedReceiveAmount,
        estimatedReceiveAmountNumber: fromIntString(estimatedReceiveAmount, decimals),
        baseFee,
        inputAmount: amountInt,
        slippage: slippageInt,
    }
}

export enum BridgeStatus {
    TRANSFER_UNKNOWN = 'TRANSFER_UNKNOWN',
    TRANSFER_SUBMITTING = 'TRANSFER_SUBMITTING',
    TRANSFER_FAILED = 'TRANSFER_FAILED',
    TRANSFER_WAITING_FOR_SGN_CONFIRMATION = 'TRANSFER_WAITING_FOR_SGN_CONFIRMATION',
    TRANSFER_WAITING_FOR_FUND_RELEASE = 'TRANSFER_WAITING_FOR_FUND_RELEASE',
    TRANSFER_COMPLETED = 'TRANSFER_COMPLETED',
    TRANSFER_TO_BE_REFUNDED = 'TRANSFER_TO_BE_REFUNDED',
    TRANSFER_REQUESTING_REFUND = 'TRANSFER_REQUESTING_REFUND',
    TRANSFER_REFUND_TO_BE_CONFIRMED = 'TRANSFER_REFUND_TO_BE_CONFIRMED',
    TRANSFER_CONFIRMING_YOUR_REFUND = 'TRANSFER_CONFIRMING_YOUR_REFUND',
    TRANSFER_REFUNDED = 'TRANSFER_REFUNDED',
    TRANSFER_DELAYED = 'TRANSFER_DELAYED'
}

export type BridgeHistoryItem = {
    type: 'celerBridge',
    hash: string;
    date: number;
    bridgeConfig: typeof bridgeConfigs[number];
    status: BridgeStatus;
    walletAddress: string;
    nonce: number;
    estimation: {
        estimatedReceiveAmount: BigNumber
        inputAmount: string,
        slippage: string,
    }
}

export const getBridgeHistory = () => {
    const history = localStorage.getItem('bridgeHistory')
    return JSON.parse(history || '[]') as BridgeHistoryItem[]
}

export const getBridgeHistoryItem = (tx: string) => {
    return getBridgeHistory().find(x => x.hash === tx)
}

export const getMostRecentBridgeHistoryItem = () => {
    return getBridgeHistory().reverse()[0]
}

const getTransferId = (
    wallet: string,
    peggedTokenAddress: string,
    amount: string,
    peggedChainId: number,
    nonce: number,
    orgChainId: number,
    orgTokenAddress: string
) => {
    return ethers.utils.solidityKeccak256(
        [
            "address",
            "address",
            "uint256",
            "uint64",
            "address",
            "uint64",
            "uint64",
            "address",
        ],
        [
            wallet, /// User's wallet address, 
            orgTokenAddress, /// User's wallet address, 
            amount, /// Wrap token address/ ERC20 token address 
            peggedChainId, /// Send amount in String 
            wallet, /// Destination chain id
            nonce, /// Nonce
            orgChainId, /// Source chain id
            chainFromChainId(orgChainId)!.celerBridgeAddress, /// Source chain id
        ],
    )
}

export const putHistory = (data: Omit<BridgeHistoryItem, 'date' | 'type' | 'status'>) => {
    const history = getBridgeHistory()
    // Only put if not yet exists
    if (history.find((item) => item.hash === data.hash)) {
        return history;
    }

    history.push({
        ...data,
        type: 'celerBridge',
        date: Date.now(),
        status: BridgeStatus.TRANSFER_UNKNOWN
    })

    localStorage.setItem('bridgeHistory', JSON.stringify(history))
    return history
}

const statusToBridgeStatus = (status: number) => {
    if (status === 0) return BridgeStatus.TRANSFER_UNKNOWN;
    if (status === 1) return BridgeStatus.TRANSFER_SUBMITTING;
    if (status === 2) return BridgeStatus.TRANSFER_FAILED;
    if (status === 3) return BridgeStatus.TRANSFER_WAITING_FOR_SGN_CONFIRMATION;
    if (status === 4) return BridgeStatus.TRANSFER_WAITING_FOR_FUND_RELEASE;
    if (status === 5) return BridgeStatus.TRANSFER_COMPLETED;
    if (status === 6) return BridgeStatus.TRANSFER_TO_BE_REFUNDED;
    if (status === 7) return BridgeStatus.TRANSFER_REQUESTING_REFUND;
    if (status === 8) return BridgeStatus.TRANSFER_REFUND_TO_BE_CONFIRMED;
    if (status === 9) return BridgeStatus.TRANSFER_CONFIRMING_YOUR_REFUND;
    if (status === 10) return BridgeStatus.TRANSFER_REFUNDED;
    if (status === 11) return BridgeStatus.TRANSFER_DELAYED;
}

export const getTransferStatus = async (item: BridgeHistoryItem) => {
    // Wait for the Celer indexer to work
    if (item.date > Date.now() + 30000) {
        return { status: statusToBridgeStatus(0) };
    }

    const response = await fetch('https://cbridge-prod2.celer.app/v2/getTransferStatus', {
        body: JSON.stringify({
            transfer_id: getTransferId(
                item.walletAddress,
                item.bridgeConfig.pegged_token.token.address,
                item.estimation.inputAmount,
                item.bridgeConfig.pegged_chain_id,
                item.nonce,
                item.bridgeConfig.org_chain_id,
                item.bridgeConfig.org_token.token.address,
            )
        }),
        method: 'post'
    });
    const result = await response.json()

    if (result.err) {
        return { status: statusToBridgeStatus(0) };
    }

    return { status: statusToBridgeStatus(result.status), raw: result }
}
