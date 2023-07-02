import { TokenInput } from "@/components/TokenInput"
import { SwapButton } from "@/components/SwapButton"
import { SwapTokens } from "@/components/SwapTokens"
import { Chain, RubicToken, Token } from "@/types"
import { useState } from "react"

export const SwapView = () => {
    const [inputToken, setInputToken] = useState<Token>();
    const [outputToken, setOutputToken] = useState<Token>();

    return (
        <div className="bg-slate-700 p-5 m-5 rounded-xl w-full">
            You&apos;re paying
            <TokenInput token={inputToken} setToken={setInputToken} />

            <SwapTokens />

            To receive
            <TokenInput token={outputToken} setToken={setOutputToken} isOtherToken />

            <SwapButton />
        </div>
    )
}