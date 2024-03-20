import { Chain, NULL_ADDRESS, EVMToken, chainsInfo } from "@/types"
import { TokenImage } from "./TokenImage"

export const TokenImageWithChain = (props: { token: EVMToken, size?: number }) => {
    return (
        <div className="relative">
            <TokenImage
                src={props.token.token.image}
                symbol={props.token.token.symbol}
                size={props.size || 24}
            />
            {/* Arb should always show the chain logo as the native is also ETH */}
            {(props.token.token.address !== NULL_ADDRESS || props.token.chain === Chain.ARBITRUM) && (
                <div className="absolute left-2 top-2">
                    <TokenImage
                        src={`/chains/${
                            chainsInfo[props.token.chain]
                                .logo
                        }`}
                        symbol={props.token.token.symbol}
                        size={14}
                    />
                </div>
            )}
        </div>
    )
}