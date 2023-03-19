import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createReturn } from "../helpers/return";
import { getPriceData} from '../helpers/bitquery';
import { BarData, getBars, getNewBars, saveBars } from "../helpers/bars";

type RequestBody = {
    chain: string;
    tokenAddress: string;
    connectorAddress: string;
    from: string;
    to: string;
    resolution: string;
}

export const handler = async (
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
    const body = event.pathParameters as RequestBody;

    if (!body?.chain || !body?.tokenAddress || !body?.from || !body?.to || !body?.resolution) {
        return createReturn(400, JSON.stringify({ status: "error", message: "Not all parameters given" }))
    }

    const index = `${body.chain}#${body.tokenAddress}#${body.resolution}`;

    // Get data from ddb
    let bars = await getBars(index, parseInt(body.from), parseInt(body.to))

    // If we have no bars, do the full range
    if (bars.length === 0) {
        const newBars = await getNewBars(
            body.chain,
            parseInt(body.from),
            parseInt(body.to),
            body.resolution,
            body.tokenAddress,
            body.connectorAddress
        )
        bars = [...bars, ...newBars];
        console.log(`Fetched ${newBars.length} bars`);
    }

    // Check if we need new bars
    // Desc: newest cached bar older than what we need
    const newestBar = bars.sort((a, b) => a.time > b.time ? -1 : 1)?.[0]?.time;
    const oldestBar = bars.sort((a, b) => a.time > b.time ? 1 : -1)?.[0]?.time;

    console.log(newestBar,oldestBar,body.to,body.from)

    if (newestBar < parseInt(body.to)) {
        console.log(`fetching from ${newestBar} to ${body.to}`)
        const newBars = await getNewBars(
            body.chain,
            newestBar + 1,
            parseInt(body.to),
            body.resolution,
            body.tokenAddress,
            body.connectorAddress
        )
        bars = [...bars, ...newBars];
        console.log(`Fetched ${newBars.length} newer bars`);
    }

    if (oldestBar > parseInt(body.from)) {
        console.log(`fetching from ${oldestBar} to ${body.from}`)
        const newBars = await getNewBars(
            body.chain,
            parseInt(body.from),
            oldestBar,
            body.resolution,
            body.tokenAddress,
            body.connectorAddress
        )
        bars = [...bars, ...newBars];
        console.log(`Fetched ${newBars.length} older bars`);
    }

    // Deduplicate and sort bars
    const barsObj = bars.reduce((acc, val) => {
        acc[val.time] = val;
        return acc;
    }, {} as Record<number, BarData>)
    const sortedBars = Object.values(barsObj)
        .sort((a: any, b: any) => a.time > b.time ? 1 : -1)
        .filter(bar => bar.time >= parseInt(body.from))
        .filter(bar => bar.time <= parseInt(body.to))

    return createReturn(200, JSON.stringify({ status: "success", bars: sortedBars }), parseInt(process.env.OHLC_CACHE_AGE!))
}
