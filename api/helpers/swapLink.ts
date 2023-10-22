import { DynamoDB } from "aws-sdk"

export const getSwapLink = async (link: string) => {
    const ddb = new DynamoDB()

    const document = await ddb
        .query({
            TableName: process.env.SWAP_LINK_TABLE_NAME!,
            KeyConditionExpression: "#link = :link",
            ExpressionAttributeNames: { '#link': 'link' },
            Limit: 1,
            ScanIndexForward: false,
            ExpressionAttributeValues: {
                ":link": { S: link },
            },
        })
        .promise()

    if (document.Items?.[0]) {
        return DynamoDB.Converter.unmarshall(document.Items?.[0]);
    }

    return undefined;
}

export const putLink = async (allData: any) => {
    const ddb = new DynamoDB();
    const { link, ...data } = allData
    const itemKeys = Object.keys(data)
    return ddb
        .updateItem({
            TableName: process.env.SWAP_LINK_TABLE_NAME!,
            Key: DynamoDB.Converter.marshall({
                link,
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