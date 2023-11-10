import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { createReturn } from '../helpers/return'
import fetch from 'node-fetch';

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    console.log(event.body)
    const body = event.pathParameters as { chain: string; address: string };

    const response = await fetch(`https://api.dextools.io/v1/pair?chain=${body.chain}&address=${body.address}`, {
        headers: {
            'X-Api-Key': process.env.DEXTOOLS_API_KEY!,
        }
    });
    const result = await response.json();

    return createReturn(
        200,
        JSON.stringify({ result }),
        60
    )
}
