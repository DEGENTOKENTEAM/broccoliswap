import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createReturn } from "../helpers/return";
import { getSwapLink } from "../helpers/swapLink";


export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const body = event.pathParameters as { link: string };

    if (!body?.link) {
        return createReturn(400, JSON.stringify({ status: "error", message: "Not all parameters given" }))
    }

    const link: any = await getSwapLink(body.link);

    // If no link is found, return success but without cache
    if (link) {
        return createReturn(200, JSON.stringify({ status: "success", link }), parseInt(process.env.SWAP_LINK_CACHE_AGE!))
    }

    return createReturn(200, JSON.stringify({ status: "success", link }), 0)
}