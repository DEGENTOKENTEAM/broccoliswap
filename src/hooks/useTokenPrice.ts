import { Token } from "@/types";
import { useQuery } from "react-query";

export default function useTokenPrice(token?: Token) {
    return useQuery({
        queryKey: ['tokenPrice', token?.chain, token?.token.address],
        queryFn: async () => {
            if (!token) {
                return 0;
            }

            if (token.type === 'evm' && token.token.usdPrice) {
                return parseFloat(token.token.usdPrice);
            }

            if (token.type === 'solana') {
                // Call jup price api
                const response = await fetch(`https://price.jup.ag/v4/price?ids=${token.token.address}`);
                const data = await response.json();
                return data.data[token.token.address].price as number;
            }

            return 0;
        },
        enabled: !!token,
        staleTime: 1000 * 60,
    })
}