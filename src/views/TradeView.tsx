import { Chart } from "@/components/Chart"
import { Swap } from "@/components/Swap"
import { TokenHeader } from "@/components/TokenHeader"
import { TokenInfo } from "@/components/TokenInfo"
import { Token } from "@/types"
import { Allotment } from "allotment"

export const TradeView = (props: { activeToken: Token }) => {
    return (
        <Allotment>
            <Allotment.Pane preferredSize="75%">
                <Allotment vertical>
                    <Allotment.Pane preferredSize={80} minSize={80}>
                        <TokenHeader token={props.activeToken} />
                    </Allotment.Pane>
                    <Allotment.Pane preferredSize="50%">
                        <Chart token={props.activeToken} />
                    </Allotment.Pane>
                    <Allotment.Pane preferredSize="50%">
                        <TokenInfo token={props.activeToken} />
                    </Allotment.Pane>
                </Allotment>
            </Allotment.Pane>
            <Allotment.Pane>
                <Swap activeToken={props.activeToken} />
            </Allotment.Pane>
        </Allotment>
    )
}