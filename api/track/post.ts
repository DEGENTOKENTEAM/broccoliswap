import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import Mixpanel from 'mixpanel'
import { createReturn } from '../helpers/return'

const mixpanel = Mixpanel.init(process.env.MIXPANEL_PROJECT_KEY!, { host: "api-eu.mixpanel.com" });

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event.body)
    const { data, name } = JSON.parse(event.body!);

    await new Promise(resolve => {
            mixpanel.track(name, data, resolve);
    })

    return createReturn(
        200,
        JSON.stringify({
            status: 'success',
        }),
    )
}
