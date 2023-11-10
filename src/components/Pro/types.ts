export type Pair = {
    statusCode: number;
    data: {
        creationBlock: number;
        team: {
            wallet: string;
        },
        dextScore: {
            total: number;
        },
        metrics: {
            liquidity: number;
            reserve: number;
            reserveRef: number;
        },
        token: {
            name: string;
            symbol: string;
            address: string;
        },
        tokenRef: {
            name: string;
            symbol: string;
            address: string;
        },
        price: number;
        price24h: {
            volume: number;
            swaps: number;
            price: number;
            priceChain: number;
            buys: number;
            sells: number;
            buysVolume: number;
            sellsVolume: number;
        },
        chain: string;
        exchange: string;
        address: string;
    }
}

type PairShort = {
    address: string;
    exchange: string;
    dextScore: number;
    price: number;
    tokenRef: {
        address: string;
        name: string;
        symbol: string;
    }
};

export type Info = {
  statusCode: number;
  data: {
    decimals: number;
    info: {
      description: string;
      email: string;
      nftCollection: string;
      ventures: boolean,
      extraInfo: string;
      dextoolsUpdatedAt: string;
    },
    links: {
      discord: string;
      github: string;
      instagram: string;
      reddit: string;
      telegram: string;
      tiktok: string;
      twitter: string;
      website: string;
      bitbucket: string;
      facebook: string;
      linkedin: string;
      medium: string;
      youtube: string;
    },
    locks: unknown[];
    logo: string;
    metrics: {
      maxSupply: number;
      totalSupply: number;
      holders: number;
      txCount: number;
      circulatingSupply: number;
    },
    name: string;
    symbol: string;
    totalSupply: string;
    creationBlock: number;
    reprPair: {
      id: {
        chain: string;
        exchange: string;
        pair: string;
        token: string;
        tokenRef: string;
      },
      price: number
    },
    audit: {
      codeVerified: boolean;
      date: string;
      lockTransactions: boolean;
      mint: boolean;
      proxy: boolean;
      status: string;
      unlimitedFees: boolean;
      version: number;
      is_contract_renounced: boolean;
      provider: string;
    },
    pairs: PairShort[];
    chain: string;
    address: string;
  }
}
