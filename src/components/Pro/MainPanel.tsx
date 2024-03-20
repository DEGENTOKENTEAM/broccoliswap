import { EVMToken, chainsInfo } from "@/types";
import { Info } from "./types";
import { useState } from "react";
import Tabs from "../Tabs";
import { useQuery } from "react-query";
import { getTokenSecurity } from "@/helpers/goPlus";
import Address from "../Address";
import { toPrecision } from "@/helpers/number";
import { classNames } from "@/helpers/classNames";
import { FaFileContract, FaLock } from "react-icons/fa";
import { Tooltip } from "react-tooltip";
import Link from "next/link";
import { BiLinkExternal } from "react-icons/bi";

const HoldersPanel = (props: { token: EVMToken }) => {
    const { data } = useQuery(['tokenSecurity', props.token.token.address, props.token.chain], async () => {
        return getTokenSecurity(chainsInfo[props.token.chain].id, props.token.token.address);
    });

    if (!data?.tokenInfo.holders) {
        return <div className="p-5">Loading...</div>
    }

    return (
        <div className="p-5">
            <div className="col-span-2 font-bold text-xl">Top holders</div>
            <table className="w-full border-separate border-spacing-y-2">
                <tr>
                    <th className="text-left"></th>
                    <th className="text-left">Address</th>
                    <th className="text-left">Balance</th>
                    <th className="text-left">% Supply</th>
                </tr>
                {data.tokenInfo.holders.map((holder) => (
                    <tr key={holder.address}>
                        <td>
                            <div className="flex items-center gap-2">
                                {holder.is_locked === 1 && <span
                                    data-tooltip-id={`tooltip-locked-${holder.address}`}
                                    data-tooltip-place="top">
                                        <FaLock />
                                </span>}
                                {holder.is_locked === 1 ? <Tooltip opacity={1} className="z-[9999]" id={`tooltip-locked-${holder.address}`}>
                                    <div className="max-w-[calc(100vw-5rem)]">
                                        Tokens are locked
                                    </div>
                                </Tooltip> : null}

                                {holder.is_contract === 1 && <span
                                    data-tooltip-id={`tooltip-contract-${holder.address}`}
                                    data-tooltip-place="top"
                                    className="text-md block">
                                        <FaFileContract />
                                </span>}
                                {holder.is_contract === 1 ? <Tooltip opacity={1} className="z-[9999]" id={`tooltip-contract-${holder.address}`}>
                                    <div className="max-w-[calc(100vw-5rem)]">
                                        Address is a contract
                                    </div>
                                </Tooltip> : null}
                            </div>
                        </td>
                        <td className="">
                            <Address chain={props.token.chain} address={holder.address} />
                        </td>
                        <td>
                            {toPrecision(parseFloat(holder.balance), 4)}
                        </td>
                        <td>{(parseFloat(holder.percent) * 100).toFixed(2)}%</td>
                    </tr>
                ))}
            </table>
            <Link
                href={`${
                    chainsInfo[props.token.chain].explorer
                }token/${props.token.token.address}#balances`}
                target="_blank"
                onClick={e => e.stopPropagation()}
                className="w-full justify-end inline-flex items-center gap-1"
            >
                    View all holders
                    <BiLinkExternal />
            </Link>

            <div className="col-span-2 font-bold text-xl mt-5">Top LP holders</div>
            <table className="w-full border-separate border-spacing-y-2">
                <tr>
                    <th className="text-left"></th>
                    <th className="text-left">Address</th>
                    <th className="text-left">Balance</th>
                    <th className="text-left">% Supply</th>
                </tr>
                {data.tokenInfo.lp_holders.map((holder) => (
                    <tr key={holder.address}>
                        <td className="">
                            <div className="flex items-center gap-2">
                                {holder.is_locked === 1 && <span
                                    data-tooltip-id={`tooltip-locked-${holder.address}`}
                                    data-tooltip-place="top">
                                        <FaLock />
                                </span>}
                                {holder.is_locked === 1 ? <Tooltip opacity={1} className="z-[9999]" id={`tooltip-locked-${holder.address}`}>
                                    <div className="max-w-[calc(100vw-5rem)]">
                                        Tokens are locked
                                    </div>
                                </Tooltip> : null}

                                {holder.is_contract === 1 && <span
                                    data-tooltip-id={`tooltip-contract-${holder.address}`}
                                    data-tooltip-place="top"
                                    className="text-md block">
                                        <FaFileContract />
                                </span>}
                                {holder.is_contract === 1 ? <Tooltip opacity={1} className="z-[9999]" id={`tooltip-contract-${holder.address}`}>
                                    <div className="max-w-[calc(100vw-5rem)]">
                                        Address is a contract
                                    </div>
                                </Tooltip> : null}
                            </div>
                        </td>
                        <td className="">
                            <Address chain={props.token.chain} address={holder.address} />
                        </td>
                        <td>
                            {toPrecision(Math.round(100 * parseFloat(holder.balance)) / 100, 4)}
                        </td>
                        <td>{(parseFloat(holder.percent) * 100).toFixed(2)}%</td>
                    </tr>
                ))}
            </table>
        </div>
    )
}

export default function MainPanel(props: { token: EVMToken; tokenInfo: Info }) {
    const [selectedTab, setSelectedTab] = useState(0);

    const tabs = [
        { name: 'Chart', current: selectedTab === 0 },
        { name: 'Holders', current: selectedTab === 1 },
    ];

    return (
        <div className={classNames(
            "relative",
        )}>
            <div className={classNames(
                "bg-darkblue rounded-lg border-2 border-activeblue overflow-hidden",
                selectedTab === 0 ? 'flex-grow h-[600px]' : ''
            )}>
                <Tabs tabs={tabs} setSelectedTab={setSelectedTab} />
                {selectedTab === 0 && <iframe src={`https://www.dextools.io/widget-chart/en/${chainsInfo[props.token.chain].dextoolsSlug}/pe-light/${props.tokenInfo.data.reprPair.id.pair}?theme=dark&chartType=1&chartResolution=1d&headerColor=023148&tvPlatformColor=023148&tvPaneColor=023148`} style={{ width: '100%', height: '100%' }} />}
                {selectedTab === 1 && <HoldersPanel token={props.token} />}
            </div>
        </div>
    )
}