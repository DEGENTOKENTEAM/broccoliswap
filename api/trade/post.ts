import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import Mixpanel from 'mixpanel'
import { createReturn } from '../helpers/return'

const mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_KEY!, { host: "api-eu.mixpanel.com" });

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const body = JSON.parse(event.body!);

    if (!body?.inputToken || !body?.inputTokenAddress || !body?.inputChain || !body?.outputToken || !body?.outputTokenAddress || !body?.outputChain || !body?.amountIn || !body?.amountInUsd || !body?.amountOut || !body?.amountOutUsd) {
        return createReturn(
            400,
            JSON.stringify({
                status: 'error',
                message: 'Not all parameters given',
            })
        )
    }

    await new Promise(resolve => {
            mixpanel.track('Trade', body, resolve);
    })

    return createReturn(
        200,
        JSON.stringify({
            status: 'success',
        }),
    )
}
