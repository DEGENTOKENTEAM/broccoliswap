import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createReturn } from '../helpers/return'
import { getBridgeTxInfo } from '../helpers/bitquery'

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const body = event.pathParameters as {
        address: string
        toChain: string
        hash: string
    }

    if (!body?.address || !body?.toChain || !body?.hash) {
        return createReturn(
            400,
            JSON.stringify({
                status: 'error',
                message: 'Not all parameters given',
            })
        )
    }

    try {
        const result: any = await getBridgeTxInfo(
            body.address,
            body.toChain,
            body.hash
        )
        return createReturn(
            200,
            JSON.stringify({
                status: 'success',
                info: result.data.ethereum.transfers[0],
            }),
            parseInt(process.env.TRANSACTIONS_CACHE_AGE!)
        )
    } catch (e) {
        return createReturn(
            200,
            JSON.stringify({
                status: 'success',
                result: 'unknown'
            }),
            parseInt(process.env.TRANSACTIONS_CACHE_AGE!)
        )
    }
}
