import { Chain, NULL_ADDRESS, chainsInfo } from "@/types";
import { TokenImage } from "../TokenImage";
import { toPrecision } from "@/helpers/number";

export const TokenAmount = (props: {
    address: string;
    logo: string;
    symbol: string;
    amount: number;
    chain: Chain;
}) => {
    return (
        <div className="bg-slate-600 relative rounded-xl flex items-center justify-center px-3 py-1 font-bold gap-1 text-white">
            <div className="flex flex-col sm:flex-row items-center gap-1">
                <div className="relative">
                    <TokenImage
                        src={props.logo}
                        symbol={props.symbol}
                        size={24}
                    />

                    {props.address !== NULL_ADDRESS && (
                        <div className="absolute left-2 top-2">
                            <TokenImage
                                src={`/chains/${chainsInfo[props.chain].logo}`}
                                symbol={props.symbol}
                                size={14}
                            />
                        </div>
                    )}
                </div>
                <div>{toPrecision(props.amount, 4)}</div>
                <div className="flex items-end">{props.symbol}</div>
            </div>
        </div>
    );
};
