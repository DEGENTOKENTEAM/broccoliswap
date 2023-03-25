import { DynamoDB  } from 'aws-sdk'
import { getPriceData } from './bitquery';

export type BarData = {
    chainTokenResolution?: undefined,
    open: number;
    close: number;
    high: number;
    low: number;
    volume: number;
    time: number;
    trades: number;
}

const convertResolutionToMinutes = (resolution: string) => {
    if (resolution === '1') return 1;
    if (resolution === '60') return 60;
    if (resolution === '1D') return 60 * 24;
    if (resolution === '1W') return 60 * 24 * 7;
    if (resolution === '1M') return 60 * 24 * 7 * 30;
    if (resolution === '1Y') return 60 * 24 * 7 * 30 * 12;
    throw Error('Incorrect resolution');
}

const saveBar = async (ddb: DynamoDB, index: string, bar: BarData) => {
    const allData = {
        chainTokenResolution: index,
        ...bar
    };
    const { chainTokenResolution, time, ...data } = allData
    const itemKeys = Object.keys(data)
    return ddb
        .updateItem({
            TableName: process.env.OHLC_TABLE_NAME!,
            Key: DynamoDB.Converter.marshall({
                chainTokenResolution,
                time,
            }),
            UpdateExpression: `SET ${itemKeys
                .map((k, index) => `#field${index} = :value${index}`)
                .join(", ")}`,
            ExpressionAttributeNames: itemKeys.reduce(
                (accumulator, k, index) => ({ ...accumulator, [`#field${index}`]: k }),
                {}
            ),
            ExpressionAttributeValues: DynamoDB.Converter.marshall(
                itemKeys.reduce(
                    (accumulator, k, index) => ({
                        ...accumulator,
                        // @ts-ignore
                        [`:value${index}`]: data[k],
                    }),
                    {}
                )
            ),
        }).promise()
}

export const getBars = async (chainTokenResolution: string, to: number, countBack: number): Promise<BarData[]> => {
    const ddb = new DynamoDB()

    const document = await ddb
        .query({
            TableName: process.env.OHLC_TABLE_NAME!,
            KeyConditionExpression: "#chainTokenResolution = :chainTokenResolution and #time <= :t1",
            ExpressionAttributeNames: { '#chainTokenResolution': 'chainTokenResolution', '#time': 'time' },
            Limit: countBack,
            ScanIndexForward: false,
            ExpressionAttributeValues: {
                ":chainTokenResolution": { S: chainTokenResolution },
                ":t1": { N: to.toString() },
                // ":t2": { N: to.toString() }, // make inclusive
            },
        })
        .promise()

    return document.Items!.map(item => {
        const data = DynamoDB.Converter.unmarshall(item) as any
        return {
            high: parseFloat(data.high),
            low: parseFloat(data.low),
            open: parseFloat(data.open),
            close: parseFloat(data.close),
            volume: parseFloat(data.tradeAmount),
            trades: parseFloat(data.trades),
            time: data.time,
            chainTokenResolution: undefined,
        }
    })
}

export const saveBars = async (chainTokenResolution: string, bars: BarData[]) => {
    const ddb = new DynamoDB()

    return Promise.all(bars.map(bar => saveBar(ddb, chainTokenResolution, bar)))
}

export const getNewBars = async (
    chain: string,
    from: number,
    to: number,
    resolution: string,
    tokenAddress: string,
    connectorAddress: string,
    countBack: number,
) => {
    const index = `${chain}#${tokenAddress}#${resolution}`;

    // Get price data from bitquery
    const priceData: any = await getPriceData(
        chain,
        from,
        to,
        countBack,
        convertResolutionToMinutes(resolution),
        tokenAddress,
        connectorAddress
    )

    if (!priceData.data) {
        console.log(JSON.stringify(priceData, null, 2))
    }

    // Parse data into OHLC array with volume and time
    const bars: BarData[] = priceData.data.ethereum.dexTrades
        .filter((interval: any) => interval.buyCurrency.address === tokenAddress)
        .map((interval: any) => {
            // Find the connector interval
            // const connectorInterval = priceData.data.ethereum.dexTrades
            //     .find((_interval: any) => _interval.buyCurrency.address === connectorAddress && _interval.timeInterval.minute === interval.timeInterval.minute)

            // if (!connectorInterval) {
            //     return {
            //         high: parseFloat(interval.high),
            //         low: parseFloat(interval.low),
            //         open: parseFloat(interval.open),
            //         close: parseFloat(interval.close),
            //         volume: parseFloat(interval.tradeAmount),
            //         trades: parseFloat(interval.trades),
            //         time: new Date(interval.timeInterval.minute).getTime(),
            //     }
            // }

            const connectorPrice = interval.tradeAmount / interval.volume

            return {
                high: parseFloat(interval.high) * connectorPrice,
                low: parseFloat(interval.low) * connectorPrice,
                open: parseFloat(interval.open) * connectorPrice,
                close: parseFloat(interval.close) * connectorPrice,
                volume: parseFloat(interval.tradeAmount) * connectorPrice,
                trades: parseFloat(interval.trades),
                time: new Date(interval.timeInterval.minute).getTime(),
            }
        }
    )

    // Save bars in dynamodb
    await saveBars(index, bars);

    return bars;
}