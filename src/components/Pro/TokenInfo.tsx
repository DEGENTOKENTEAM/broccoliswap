import { Tooltip } from 'react-tooltip'
import { subAddress } from "@/helpers/address";
import { toPrecision } from "@/helpers/number";
import { getTokenTaxes } from "@/helpers/tokenTax";
import { useAsyncEffect } from "@/hooks/useAsyncEffect";
import { Token, chainsInfo } from "@/types";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BiCheckCircle, BiLinkExternal } from "react-icons/bi";
import { Info, Pair } from "./types";
import { FaGlobe, FaDiscord, FaTelegram, FaTiktok, FaInstagram, FaGithub, FaReddit, FaMedium, FaYoutube, FaCheck } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import Tabs from "../Tabs";
import { UseQueryResult, useQuery } from "react-query";
import { GOPLUS_CREATOR_PERCENT_ERROR_THRESHOLD, GOPLUS_CREATOR_PERCENT_WARNING_THRESHOLD, GOPLUS_HONEYPOTS_WARNING_THRESHOLD, GoPlusTokenReponse, getTokenSecurity } from "@/helpers/goPlus";
import { classNames } from "@/helpers/classNames";

import 'react-tooltip/dist/react-tooltip.css'
import { IoMdHelpCircle, IoMdHelpCircleOutline } from 'react-icons/io';
import { PiWarningBold } from 'react-icons/pi';
import { IoClose } from 'react-icons/io5';

const SocialLink = (props: { children: any; link: string }) => {
    return (
        <a className="bg-dark rounded-full p-2 border-2 border-activeblue cursor-pointer hover:bg-activeblue" href={props.link} target="_blank" rel="noreferrer">{props.children}</a>
    )
}

const InfoTab = (props: { token: Token; info: Info, pairs: Pair[] }) => {
    const { info, pairs } = props;
    const [tokenTax, setTokenTax] = useState<Awaited<ReturnType<typeof getTokenTaxes>>>()

    const usdLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + (pair.data.metrics.liquidity ?? 0), 0);
    }, [pairs]);

    const tokenLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + (pair.data.metrics.reserve ?? 0), 0);
    }, [pairs]);

    const tokenRefLiquidity = useMemo(() => {
        return pairs.reduce((acc, pair) => acc + (pair.data.metrics.reserveRef ?? 0), 0);
    }, [pairs]);

    useAsyncEffect(async () => {
        setTokenTax(await getTokenTaxes(props.token.chain, props.token.token.address));
    }, [props.token]);

    return (
        <>
            <div className="grid grid-cols-2 gap-1">
                <div className="col-span-2 font-bold text-xl">Token info</div>

                <div className="font-bold">Contract</div>
                <div className="flex items-center"> 
                    <Link
                        href={`${
                            chainsInfo[props.token.chain].explorer
                        }token/${props.token.token.address}`}
                        target="_blank"
                        onClick={e => e.stopPropagation()}
                        className="flex items-center gap-1"
                    >
                            {subAddress(props.token.token.address)}{" "}
                            <BiLinkExternal />
                    </Link>
                </div>

                <div className="font-bold">Market cap</div>
                <div className="">${toPrecision(info.data.metrics.totalSupply * info.data.reprPair.price, 4)}</div>

                <div className="font-bold">Max. supply</div>
                <div className="">{toPrecision(info.data.metrics.maxSupply, 6)}</div>

                <div className="font-bold">Total supply</div>
                <div className="">{toPrecision(info.data.metrics.totalSupply, 6)}</div>

                <div className="font-bold">Holders</div>
                <div className="">{toPrecision(info.data.metrics.holders, 0)}</div>

                {info.data.metrics.txCount > 0 ? <>
                    <div className="font-bold">TX Count</div>
                    <div className="">{toPrecision(info.data.metrics.txCount, 0)}</div>
                </> : null}

                <div className="font-bold">
                  Liquidity<br />
                  <span className="text-xs font-normal">
                    {pairs.length === 5 ? 'Top 5 pairs' : `From ${pairs.length} pairs`}
                  </span>
                </div>
                <div className="">
                    ${toPrecision(usdLiquidity, 4)}<br />
                    {toPrecision(tokenLiquidity, 4)} {pairs[0].data.token.symbol}<br />
                    {toPrecision(tokenRefLiquidity, 4)} {pairs[0].data.tokenRef.symbol}
                </div>

                {tokenTax && tokenTax.buyTax !== -1 && tokenTax.sellTax !== -1 && <>
                    <div className="col-span-2 font-bold text-xl">Token taxes</div>
                    <div className="font-bold">Buy tax</div>
                    <div className="">{tokenTax.buyTax}%</div>

                    <div className="font-bold">Sell tax<br /><span className="text-xs font-normal">*Includes DEX fee</span></div>
                    <div className="">{tokenTax.sellTax}%</div>
                </>}
            </div>
            <div className="flex xl:justify-center text-xl gap-1 flex-wrap mt-5">
                {info.data.links.website && (<SocialLink link={info.data.links.website}><FaGlobe /></SocialLink>)}
                {info.data.links.discord && (<SocialLink link={info.data.links.discord}><FaDiscord /></SocialLink>)}
                {info.data.links.telegram && (<SocialLink link={info.data.links.telegram}><FaTelegram /></SocialLink>)}
                {info.data.links.twitter && (<SocialLink link={info.data.links.twitter}><FaXTwitter /></SocialLink>)}
                {info.data.links.tiktok && (<SocialLink link={info.data.links.tiktok}><FaTiktok /></SocialLink>)}
                {info.data.links.instagram && (<SocialLink link={info.data.links.instagram}><FaInstagram /></SocialLink>)}
                {info.data.links.github && (<SocialLink link={info.data.links.github}><FaGithub /></SocialLink>)}
                {info.data.links.reddit && (<SocialLink link={info.data.links.reddit}><FaReddit /></SocialLink>)}
                {info.data.links.medium && (<SocialLink link={info.data.links.medium}><FaMedium /></SocialLink>)}
                {info.data.links.youtube && (<SocialLink link={info.data.links.youtube}><FaYoutube /></SocialLink>)}
            </div>
        </>
    );
}

const SecurityTabItem = (props: {
    condition: boolean;
    title: string;
    value: string;
    description?: string;
    descriptionExtended?: string;
    isWarning?: boolean;
    isError?: boolean;
    isSuccess?: boolean;
}) => {
    return (
        props.condition ? (
            <>
                <div
                    className="flex gap-1 items-center"
                >
                    <div className="font-bold flex-grow flex gap-1 items-center">
                        {props.description && (
                            <span
                                data-tooltip-id={`tooltip-${props.title}`}
                                data-tooltip-place="top"
                            >
                                <span className="text-white">
                                    <IoMdHelpCircleOutline />
                                </span>
                            </span>
                        )}
                        {props.title}
                    </div>
                    <div className={classNames(
                        props.isWarning && !props.isError && 'text-warning font-bold',
                        props.isError && 'text-error font-bold',
                        props.isSuccess && 'text-success font-bold',
                    )}>{props.value}</div>
                </div>
                {props.description && <Tooltip opacity={1} className="z-[9999]" id={`tooltip-${props.title}`}>
                    <div className="max-w-[calc(100vw-5rem)]">
                        <div className="w-64">
                            {props.description}
                            {props.descriptionExtended && (
                                <div className="text-xs">
                                    {props.descriptionExtended}
                                </div>
                            )}
                        </div>
                    </div>
                </Tooltip>}
            </>
         ) : null
    )
};

const SecurityTab = (props: { token: Token; data: UseQueryResult<GoPlusTokenReponse>['data'] }) => {
    // Descriptions: https://pkg.go.dev/github.com/GoPlusSecurity/goplus-sdk-go/pkg/gen/models
    return (
        <div>
            <div className="col-span-2 font-bold text-xl">Security</div>
            {props.data?.tokenInfo
                ? (
                    <div className="flex flex-col gap-1">
                        <SecurityTabItem
                            condition={!!props.data.whitelisted}
                            title="Whitelisted"
                            description="If this token is whitelisted on Broccoliswap."
                            value={props.data.whitelisted ? 'Yes' : 'No'}
                            isSuccess={props.data.whitelisted}
                        />
                        <SecurityTabItem
                            condition={!!props.data.buy_tax}
                            title="Buy tax"
                            description="The buy tax of this token. Excludes DEX fee."
                            value={`${props.data.buy_tax.toFixed(2)}%`}
                            isWarning={props.data.buy_tax > 3}
                            isError={props.data.buy_tax > 10}
                        />
                        <SecurityTabItem
                            condition={!!props.data.sell_tax}
                            title="Sell tax"
                            description="The buy tax of this token. Excludes DEX fee."
                            value={`${props.data.sell_tax.toFixed(2)}%`}
                            isWarning={props.data.sell_tax > 3}
                            isError={props.data.sell_tax > 10}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.creator_percent}
                            title="Creator percent"
                            description="How much of the supply the token creator holds."
                            value={`${props.data.tokenInfo.creator_percent}%`}
                            isWarning={parseFloat(props.data.tokenInfo.creator_percent) >= GOPLUS_CREATOR_PERCENT_WARNING_THRESHOLD}
                            isError={parseFloat(props.data.tokenInfo.creator_percent) >= GOPLUS_CREATOR_PERCENT_ERROR_THRESHOLD}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.anti_whale_modifiable}
                            title="Anti whale modifiable"
                            description="Whether contract has the function to modify the maximum amount of transactions or the maximum token position."
                            descriptionExtended="When the anti whale value is set to a very small value, all trading would fail."
                            value={props.data.tokenInfo.anti_whale_modifiable === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.anti_whale_modifiable === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.can_take_back_ownership}
                            title="Can take back ownership"
                            description="Whether contract has the function to take back ownership."
                            descriptionExtended="Ownership is mostly used to adjust the parameters and status of the contract, such as minting, modification of slippage, suspension of trading, setting blacklist, etc."
                            value={props.data.tokenInfo.can_take_back_ownership === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.can_take_back_ownership === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.cannot_buy}
                            title="Cannot buy"
                            description="Whether or not the token can be bought."
                            value={props.data.tokenInfo.cannot_buy === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.cannot_buy === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.cannot_sell_all}
                            title="Cannot sell all"
                            description="Whether the contract has the function restricting token holder selling all their tokens."
                            descriptionExtended="This means that you will not be able to sell all your tokens in a single sale. Sometimes you need to leave a certain percentage of the token, e.g. 10%, sometimes you need to leave a fixed number of token, such as 10 tokens."
                            value={props.data.tokenInfo.cannot_sell_all === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.cannot_sell_all === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.honeypot_with_same_creator}
                            title="Creator made honeypots"
                            description="If the creator address also made honeypots."
                            value={props.data.tokenInfo.honeypot_with_same_creator !== '0' ? 'Yes' : 'No'}
                            isError={parseFloat(props.data.tokenInfo.honeypot_with_same_creator) >= GOPLUS_HONEYPOTS_WARNING_THRESHOLD}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_anti_whale}
                            title="Anti whale"
                            description="Describes whether the contract has the function to limit the maximum amount of transactions or the maximum token position for a single address."
                            value={props.data.tokenInfo.is_anti_whale === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.is_anti_whale === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_blacklisted}
                            title="Has blacklist"
                            description="Describes whether the blacklist function is not included in the contract. If there is a blacklist, some addresses may not be able to trade normally."
                            descriptionExtended="The contract owner may add any address into the blacklist, and the token holder in blacklist will not be able to trade. Abuse of the blacklist function will lead to great risks."
                            value={props.data.tokenInfo.is_blacklisted === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.is_blacklisted === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_honeypot}
                            title="Is honeypot"
                            description="Whether the token is a honeypot. Honeypot means that the token maybe cannot be sold because of the token contract's function, Or the token contains malicious code."
                            value={props.data.tokenInfo.is_honeypot === '1' ? 'Yes' : 'No'}
                            isError={props.data.tokenInfo.is_honeypot === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_in_dex}
                            title="Not listed on DEX"
                            description="Whether the token can be traded on the main DEX of the chain."
                            value={props.data.tokenInfo.is_in_dex === '1' ? 'No' : 'Yes'}
                            isWarning={props.data.tokenInfo.is_in_dex === '0'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_mintable}
                            title="Is mintable"
                            description="Whether this contract has the function to mint tokens."
                            value={props.data.tokenInfo.is_mintable === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.is_mintable === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_open_source}
                            title="Is closed source"
                            description="Whether this contract is closed source. Un-open-sourced contracts may hide various unknown mechanisms and are extremely risky. When the contract is not open source, we will not be able to detect other risk items."
                            value={props.data.tokenInfo.is_open_source === '1' ? 'No' : 'Yes'}
                            isError={props.data.tokenInfo.is_open_source === '0'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_proxy}
                            title="Is proxy contract"
                            description="Whether this contract has a proxy contract."
                            descriptionExtended="Most proxy contracts are accompanied by modifiable implementation contracts, and implementation contracts may contain significant potential risk. When the contract is a proxy, we cannot detect other risk items, therefore this is regarded as a high-risk item."
                            value={props.data.tokenInfo.is_proxy === '1' ? 'Yes' : 'No'}
                            isError={props.data.tokenInfo.is_proxy === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.is_whitelisted}
                            title="Has whitelist"
                            description="Whether the whitelist function is included in the contract. If there is a whitelist, some addresses may not be able to trade normally."
                            descriptionExtended="Whitelisting is mostly used to allow specific addresses to make early transactions, tax-free, and not affected by transaction suspension."
                            value={props.data.tokenInfo.is_whitelisted === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.is_whitelisted === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.owner_change_balance}
                            title="Owner can change balance"
                            description="Whether contract owner has the authority to change the balance of any token holder."
                            descriptionExtended="This feature means that the owner can modify anyone's balance, resulting in an asset straight to zero or a massive minting and sell-off."
                            value={props.data.tokenInfo.owner_change_balance === '1' ? 'Yes' : 'No'}
                            isError={props.data.tokenInfo.owner_change_balance === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.personal_slippage_modifiable}
                            title="Personal slippage modifiable"
                            description="Whether the owner can set a different tax rate for every assigned address."
                            descriptionExtended="The contract owner may set a very outrageous tax rate for assigned address to block it from trading. Abuse of this funtcion will lead to great risks."
                            value={props.data.tokenInfo.personal_slippage_modifiable === '1' ? 'Yes' : 'No'}
                            isError={props.data.tokenInfo.personal_slippage_modifiable === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.selfdestruct}
                            title="Selfdestruct"
                            description="Whether this contract can self destruct."
                            descriptionExtended="When the self-destruct function is triggered, this contract will be destroyed, all functions will be unavailable, and all related assets will be erased)."
                            value={props.data.tokenInfo.selfdestruct === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.selfdestruct === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.trading_cooldown}
                            title="Trading cooldown"
                            description="Whether the contract has trading-cool-down mechanism which can limits the minimum time between two transactions."
                            value={props.data.tokenInfo.trading_cooldown === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.trading_cooldown === '1'}
                        />
                        <SecurityTabItem
                            condition={!!props.data.tokenInfo.transfer_pausable}
                            title="Transfer pausable"
                            description="Whether trading can be pausable by token contract."
                            descriptionExtended="This feature means that the contract owner will be able to suspend trading at any time, after that anyone will not be able to sell, except those who have special authority."
                            value={props.data.tokenInfo.transfer_pausable === '1' ? 'Yes' : 'No'}
                            isWarning={props.data.tokenInfo.transfer_pausable === '1'}
                        />
                    </div>
                )
                : 'Loading...'}
        </div>
    );
}

export const TokenInfo = (props: { token: Token; info: Info, pairs: Pair[] }) => {
    const [selectedTab, setSelectedTab] = useState(0);

    const { data: securityData } = useQuery(['tokenSecurity', props.token.token.address, props.token.chain], async () => {
        return getTokenSecurity(chainsInfo[props.token.chain].id, props.token.token.address);
    });

    const tabs = [
        { name: 'Info', current: selectedTab === 0 },
        { 
            name: <div className="justify-center flex items-center gap-1">
                Security
                {(securityData?.whitelisted || (!securityData?.hasWarning && !securityData?.hasError)) && <BiCheckCircle className="text-success text-xl" />}
                {securityData?.hasWarning && !securityData?.hasError && <PiWarningBold className="text-warning text-xl" />}
                {securityData?.hasError && <PiWarningBold className="text-error text-xl" />}
            </div>,
            current: selectedTab === 1
        },
    ];

    return (
        <div className=" bg-darkblue border-activeblue border-2 rounded-xl">
            <Tabs tabs={tabs} setSelectedTab={setSelectedTab} />
            <div className="p-5">
                {selectedTab === 0 && <InfoTab token={props.token} info={props.info} pairs={props.pairs} />}
                {selectedTab === 1 && <SecurityTab token={props.token} data={securityData} />}
            </div>
        </div>
    )
}