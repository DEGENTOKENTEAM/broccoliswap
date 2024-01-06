import BigNumber from "bignumber.js";
import { fromIntString, toIntString, toPrecision } from "./number";

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
    }
]

export const getEstimation = async (
    srcChain: number,
    dstChain: number,
    tokenSymbol: string,
    amount: number,
    decimals: number,
    slippage: number
) => {
    const slippageInt = (slippage * 1e6).toString();
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