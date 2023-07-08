import { DynamoDB } from "aws-sdk"
import { getTxForConnectorAddress } from "./bitquery"
import { usdcAddressPerChain } from "./usdcTokenAddresses"

const saveConnectorAddress = async (allData: { chain: string, token: string, connectorAddress: string }) => {
    const ddb = new DynamoDB()
    const { chain, token, ...data } = allData
    const itemKeys = Object.keys(data)
    return ddb
        .updateItem({
            TableName: process.env.CONNECTOR_ADDRESS_TABLE_NAME!,
            Key: DynamoDB.Converter.marshall({
                chain,
                token,
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

const getConnectorFromDDB = async (chain: string, tokenAddress: string): Promise<{ connectorAddress: string }> => {
    const ddb = new DynamoDB()

    const document = await ddb
        .query({
            TableName: process.env.CONNECTOR_ADDRESS_TABLE_NAME!,
            KeyConditionExpression: "#chain = :chain and #token = :token",
            ExpressionAttributeNames: { '#chain': 'chain', '#token': 'token' },
            ExpressionAttributeValues: {
                ":chain": { S: chain },
                ":token": { S: tokenAddress },
            },
        })
        .promise()

    return document.Items!.map(item => {
        const data = DynamoDB.Converter.unmarshall(item) as any
        return data
    })[0]
}

export const getConnectorAddress = async (chain: string, tokenAddress: string) => {
    // Try to get from ddb
    const cachedConnector = await getConnectorFromDDB(chain, tokenAddress);
    let connectorAddress = cachedConnector?.connectorAddress
    if (connectorAddress) {
        return connectorAddress
    }

    console.log(`Connector not found, fetching from bitquery`)
    
    // Try USDC connector, if that doesn't exist, just take the first one
    const result = await getTxForConnectorAddress(chain, tokenAddress, true);

    if (!result.data) {
        console.log(JSON.stringify(result, null, 2))
    }

    if (result.data.ethereum.dexTrades.length > 0) {
        connectorAddress = (usdcAddressPerChain as any)[chain]
    } else {
        const result = await getTxForConnectorAddress(chain, tokenAddress, false);
        if (!result.data) {
            console.log(JSON.stringify(result, null, 2))
        }
        connectorAddress = result?.data?.ethereum?.dexTrades?.[0]?.sellCurrency?.address
    }

    if (!connectorAddress) {
        console.log(JSON.stringify(result, null, 2))
        throw Error('Cannot get connector address')
    }

    // Save connector address in dynamodb and return
    await saveConnectorAddress({ chain, token: tokenAddress, connectorAddress })
    return connectorAddress
}
