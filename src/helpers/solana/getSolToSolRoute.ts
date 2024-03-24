import { SolanaToken } from "@/types";

export default async function getSolToSolRoute(
    inputToken: SolanaToken,
    outputToken: SolanaToken,
    amount: number,
    slippage: number
) {
    const response = await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${inputToken.token.address}&outputMint=${outputToken.token.address}&amount=${amount * (10 ** inputToken.token.decimals)}&slippageBps=${Math.round(slippage * 100)}`)
    const result = await response.json() as {
        inputMint: string;
        inAmount: string;
        outputMint: string;
        outAmount: string;
        otherAmountThreshold: string;
        swapMode: string;
        slippageBps: number;
        platformFee: number;
        priceImpactPct: string;
        contextSlot: number;
        timeTaken: number;
    };

    return result;
}