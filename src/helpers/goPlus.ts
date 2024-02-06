type TokenInfo = {
    anti_whale_modifiable: string;
    can_take_back_ownership: string;
    cannot_buy: string;
    cannot_sell_all: string;
    creator_address: string;
    creator_balance: string;
    creator_percent: string;
    external_call: string;
    hidden_owner: string;
    holder_count: string;
    honeypot_with_same_creator: string;
    is_anti_whale: string;
    is_blacklisted: string;
    is_honeypot: string;
    is_in_dex: string;
    is_mintable: string;
    is_open_source: string;
    is_proxy: string;
    is_whitelisted: string;
    lp_holder_count: string;
    lp_total_supply: string;
    owner_address: string;
    owner_balance: string;
    owner_change_balance: string;
    owner_percent: string;
    personal_slippage_modifiable: string;
    selfdestruct: string;
    slippage_modifiable: string;
    token_name: string;
    token_symbol: string;
    total_supply: string;
    trading_cooldown: string;
    transfer_pausable: string;
}

export type GoPlusTokenReponse = {
    buy_tax: number;
    sell_tax: number;
    tokenInfo: TokenInfo;
    hasWarning?: boolean;
    hasError?: boolean;
}

const cache: Record<string, GoPlusTokenReponse> = {}

export const getTokenSecurity = async (chainId: number, tokenAddress: string): Promise<GoPlusTokenReponse> => {
    if (cache[`${chainId}-${tokenAddress}`]) {
        return cache[`${chainId}-${tokenAddress}`];
    }

    const response = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${chainId}?contract_addresses=${tokenAddress}`)
    const { result }= await response.json();
    const tokenInfo = Object.values(result)[0] as any;

    const buyTax = 100 * parseFloat(tokenInfo?.buy_tax || '0');
    const sellTax = 100 * parseFloat(tokenInfo?.sell_tax || '0');

    const hasWarning = buyTax > 3
        || sellTax > 3
        || parseFloat(tokenInfo?.creator_percent || '0') > GOPLUS_CREATOR_PERCENT_WARNING_THRESHOLD
        || parseFloat(tokenInfo?.honeypot_with_same_creator || '0') > GOPLUS_HONEYPOTS_WARNING_THRESHOLD
        || tokenInfo.anti_whale_modifiable === '1'
        || tokenInfo.can_take_back_ownership === '1'
        || tokenInfo.cannot_buy === '1'
        || tokenInfo.cannot_sell_all === '1'
        || tokenInfo.is_mintable === '1'
        || tokenInfo.is_anti_whale === '1'
        || tokenInfo.is_blacklisted === '1'
        || tokenInfo.is_in_dex === '0'
        || tokenInfo.is_whitelisted === '1'
        || tokenInfo.selfdestruct === '1'
        || tokenInfo.trading_cooldown === '1'
        || tokenInfo.transfer_pausable === '1';
    const hasError = buyTax > 10
        || sellTax > 10
        || parseFloat(tokenInfo.creator_percent) >= GOPLUS_CREATOR_PERCENT_ERROR_THRESHOLD
        || parseFloat(tokenInfo.honeypot_with_same_creator) >= GOPLUS_HONEYPOTS_WARNING_THRESHOLD
        || tokenInfo.is_honeypot === '1'
        || tokenInfo.is_open_source === '0'
        || tokenInfo.owner_change_balance === '1'
        || tokenInfo.is_proxy === '1'
        || tokenInfo.personal_slippage_modifiable === '1';

    
    cache[`${chainId}-${tokenAddress}`] = {
        buy_tax: buyTax,
        sell_tax: sellTax,
        tokenInfo,
        hasWarning,
        hasError
    }

    return cache[`${chainId}-${tokenAddress}`];
}

export const GOPLUS_CREATOR_PERCENT_WARNING_THRESHOLD = 25;
export const GOPLUS_CREATOR_PERCENT_ERROR_THRESHOLD = 50;
export const GOPLUS_HONEYPOTS_WARNING_THRESHOLD = 1;