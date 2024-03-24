import { SolanaTokenInfo, Token } from "@/types";
import { useQuery } from "react-query";

export default function useTokenPrice() {
    return useQuery({
        queryKey: ['solana-token-list'],
        queryFn: async () => {
            const response = await fetch(`https://token.jup.ag/all`);
            const data = await response.json();
            return data as SolanaTokenInfo[];
        },
        staleTime: 1000 * 60 * 60,
    })
}