import { TokenInput } from "@/components/TokenInput"
import { SwapButton } from "@/components/SwapButton"
import { Token } from "@/__old__types"
import { SwapTokens } from "@/components/SwapTokens"

export const SwapView = () => {
    return (
        <div className="bg-slate-700 p-5 m-5 rounded-xl w-full">
            You&apos;re paying
            <TokenInput />

            <SwapTokens />

            To receive
            <TokenInput isOtherToken />

            <SwapButton />
        </div>
    )
}