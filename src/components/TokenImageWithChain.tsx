import { Chain, NULL_ADDRESS, EVMToken, chainsInfo, Token } from "@/types"
import { TokenImage } from "./TokenImage"
import { getChainLogo, getTokenLogo } from "@/helpers/chain"

export const TokenImageWithChain = (props: { token: Token, size?: number }) => {
    return (
        <div className="relative">
            <TokenImage
                src={getTokenLogo(props.token)}
                symbol={props.token.token.symbol}
                size={props.size || 24}
            />
            {/* Arb should always show the chain logo as the native is also ETH */}
            {(props.token.token.address !== NULL_ADDRESS || props.token.chain === Chain.ARBITRUM || props.token.chain === Chain.BASE) && (
                <div className="absolute left-2 top-2">
                    <TokenImage
                        src={`/chains/${getChainLogo(props.token)}`}
                        symbol={props.token.token.symbol}
                        size={14}
                    />
                </div>
            )}
        </div>
    )
}