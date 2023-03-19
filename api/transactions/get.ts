import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createReturn } from "../helpers/return";
import { getPriceData, getRecentTransactions } from '../helpers/bitquery';
import { BarData, getBars, getNewBars, saveBars } from "../helpers/bars";

const excludeAddresses = {
    '0x51e48670098173025c477d9aa3f0eff7bf9f7812': ['0x223b26cc3d0154ee9b625e94eb194940a8ca3867']
}

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const body = event.pathParameters as { chain: string, tokenAddress: string };

    if (!body?.chain || !body?.tokenAddress) {
        return createReturn(400, JSON.stringify({ status: "error", message: "Not all parameters given" }))
    }

    const recentTransactionsResult: any = await getRecentTransactions(body.chain, body.tokenAddress, (excludeAddresses as any)[body.tokenAddress]);

    const transactions = recentTransactionsResult.data.ethereum.dexTrades

    return createReturn(200, JSON.stringify({ status: "success", transactions }), parseInt(process.env.TRANSACTIONS_CACHE_AGE!))
}