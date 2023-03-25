import moment from 'moment';
import fetch from 'node-fetch';
import { usdcAddressPerChain } from './usdcTokenAddresses';

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
    countBack: number,
    intervalInMinutes: number,
    baseAddress: string,
    connectorAddress: string,
) => {
    return bitqueryFetch(
        `#graphql
        query (
            $network: EthereumNetwork!,
            $baseAddress: String!,
            # $quoteAddress: String!,
            $connectorAddress: String!,
            # $from: ISO8601DateTime!,
            $countBack: Int!,
            $till: ISO8601DateTime!,
            $interval: Int
        ) {
          ethereum(network: $network) {
            dexTrades(
              # any: [
                # {
                #   baseCurrency: {is: $baseAddress}
                #   quoteCurrency: {is: $quoteAddress}
                # },
                # {
                  baseCurrency: {is: $baseAddress}
                  quoteCurrency: {is: $connectorAddress}
                # },
                # {
                #   baseCurrency: {is: $connectorAddress}
                #   quoteCurrency: {is: $quoteAddress}
                # }
              # ]
              date: {till: $till}
              tradeAmountUsd: {gt: 10}
              options: {limit: $countBack, desc: "timeInterval.minute"}
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
            "countBack": countBack,
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

export const getTxForConnectorAddress = async (network: string, tokenAddress: string, testUsdc: boolean): Promise<any> => {
  return bitqueryFetch(`#graphql
      query ($network: EthereumNetwork!, $token: String!) {
        ethereum(network: $network) {
          dexTrades(
            baseCurrency: {is: $token}
            ${testUsdc ? `quoteCurrency: {is: "${(usdcAddressPerChain as any)[network]}"}` : ''}
            options: {limit: 1, desc: "timeInterval.day", limitBy: {each: "sellCurrency.address", limit: 1}}
          ) {
            timeInterval {
              day(format: "%FT%TZ", count: 60)
            }
            buyCurrency: baseCurrency {
              symbol
              address
            }
            sellCurrency: quoteCurrency {
              symbol
              address
            }
          }
        }
      }
    `, {
      "network": network,
      "token": tokenAddress
  })
}
