import { TokenSelector } from "@/components/TokenSelector"
import { SwapButton } from "@/components/SwapButton"
import { Token } from "@/__old__types"
import { SwapTokens } from "@/components/SwapTokens"

export const SwapView = () => {
    return (
        <div className="bg-slate-700 p-5 m-5 rounded-xl w-full">
            You&apos;re paying
            <TokenSelector />

            <SwapTokens />

            To receive
            <TokenSelector isOtherToken />

            <SwapButton />
        </div>
    )
}