import moment from 'moment';
import fetch from 'node-fetch'; 

const usdcAddressPerChain = {
    avalanche: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
    bsc: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
    ethereum: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
}

const bitqueryFetch = async (query: string, variables: Record<string, any>) => {
    const data = await fetch('https://graphql.bitquery.io/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': process.env.BITQUERY_API_KEY!
        },
        body: JSON.stringify({
            query,
            variables
        })
    })

    return data.json();
}

export const getPriceData = async (
    network: string,
    from: number,
    to: number,
    intervalInMinutes: number,
    baseAddress: string,
    connectorAddress: string,
) => {
    return bitqueryFetch(
        `#graphql
        query (
            $network: EthereumNetwork!,
            $baseAddress: String!,
            $quoteAddress: String!,
            $connectorAddress: String!,
            $from: ISO8601DateTime!,
            $till: ISO8601DateTime!,
            $interval: Int
        ) {
          ethereum(network: $network) {
            dexTrades(
              any: [
                {
                  baseCurrency: {is: $baseAddress}
                  quoteCurrency: {is: $quoteAddress}
                },
                {
                  baseCurrency: {is: $baseAddress}
                  quoteCurrency: {is: $connectorAddress}
                },
                {
                  baseCurrency: {is: $connectorAddress}
                  quoteCurrency: {is: $quoteAddress}
                }
              ]
              date: {since: $from, till: $till}
              tradeAmountUsd: {gt: 10}
            ) {
              timeInterval {
                minute(format: "%FT%TZ", count: $interval)
              }
              buyCurrency: baseCurrency {
                symbol
                address
              }
              buyAmount: baseAmount
              buyAmountInUsd: baseAmount
              sellCurrency: quoteCurrency {
                symbol
                address
              }
              sellAmountInUsd: quoteAmount
              tradeAmount(in: USD)
              volume: quoteAmount
              trades: count
              high: quotePrice(calculate: maximum)
              low: quotePrice(calculate: minimum)
              open: minimum(of: block, get: quote_price)
              close: maximum(of: block, get: quote_price)
            }
          }
        }
        `,
        {
            "network": network,
            "from": new Date(from).toISOString(),
            "till": new Date(to).toISOString(),
            "interval": intervalInMinutes,
            "baseAddress": baseAddress,
            "quoteAddress": (usdcAddressPerChain as any)[network],
            "connectorAddress": connectorAddress
        }
    )
}

export const getRecentTransactions = async (network: string, tokenAddress: string, excludeAddresses: string[]) => {
    return bitqueryFetch(`#graphql
        query ($network: EthereumNetwork!, $token: String!, $limit: Int!, $offset: Int!, $from: ISO8601DateTime, $till: ISO8601DateTime, $excludeAddresses: [String!]!) {
          ethereum(network: $network) {
            dexTrades(
              options: {desc: ["block.height", "tradeIndex"], limit: $limit, offset: $offset}
              date: {since: $from, till: $till}
              quoteCurrency: {is: $token}
            ) {
              block {
                timestamp {
                  time(format: "%Y-%m-%d %H:%M:%S")
                }
                height
              }
              tradeIndex
              protocol
              exchange {
                fullName
              }
              baseAmount
              baseCurrency {
                address
                symbol
              }
              base_amount_usd: baseAmount(in: USD)
              quoteAmount
              quoteCurrency {
                address
                symbol
              }
              quote_amount_usd: quoteAmount(in: USD)
              transaction {
                hash
              }
              maker(maker: {notIn: $excludeAddresses}) {
                address
              }
              smartContract {
                address {
                  address
                  annotation
                }
              }
              taker(taker: {notIn: $excludeAddresses}) {
                address
              }
              side
            }
          }
        }
    `, {
        "limit": 50,
        "offset": 0,
        "network": network,
        "token": tokenAddress,
        "excludeAddresses": excludeAddresses,
        "from": moment().subtract(3, 'days').format('YYYY-MM-DD'),
        "till": moment().format('YYYY-MM-DD'),
        "dateFormat": "%Y-%m-%d"
    })
}
