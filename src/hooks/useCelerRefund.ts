import { chainFromChainId } from "@/helpers/chain";
import { useAccount, useContractWrite } from "wagmi";

import celerAbi from '../abi/celerBridge.json';
import { useEffect, useState } from "react";
import { BridgeHistoryItem, getTransferStatus } from "@/helpers/celer";
import { base64, hexlify, getAddress } from "ethers/lib/utils";
import { useAsyncEffect } from "./useAsyncEffect";
import { toHex } from "viem";

export default function useCelerRefund(
    item: BridgeHistoryItem
) {
    const [transferData, setTransferData] = useState<any>();

    useAsyncEffect(async () => {
        const { raw } = await getTransferStatus(item);

        const wdmsg = toHex(base64.decode(raw.wd_onchain));
        const signers = raw.signers.map((item: any) => {
            const decodeSigners = base64.decode(item);
            const hexlifyObj = hexlify(decodeSigners);
            return getAddress(hexlifyObj);
        });
        const sigs = raw.sorted_sigs.map((item: any) => {
            return toHex(base64.decode(item));
        });
        const powers = raw.powers.map((item: any) => {
            return toHex(base64.decode(item));
        });
        setTransferData({ wdmsg, signers, sigs, powers });
    }, [])

    const { data, isLoading, isSuccess, write } = useContractWrite({
        address: chainFromChainId(item.bridgeConfig.org_chain_id)!.celerBridgeAddress,
        abi: celerAbi,
        functionName: 'withdraw',
        args: [
            transferData?.wdmsg,
            transferData?.sigs,
            transferData?.signers,
            transferData?.powers
        ]
    })

    return { data, isLoading, isSuccess, write };
}