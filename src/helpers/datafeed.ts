import { Token } from '@/types';
import moment from 'moment';

const configurationData = {
    supported_resolutions: ['60', '1D', '1W', '1M', '1Y'],
    exchanges: [],
    symbols_types: [],
};

export const datafeed = (token: Token) => ({
    onReady: (callback: (x: any) => void) => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },
    searchSymbols: () => {
        console.log('[searchSymbols]: Method call');
    },
    resolveSymbol: (symbolName: string, onSymbolResolvedCallback: Function, onResolveErrorCallback: Function) => {
        console.log('[resolveSymbol]: Method call', symbolName);
        setTimeout(() => onSymbolResolvedCallback({
            ticker: `${symbolName}/USDC`,
            name: symbolName,
            description: `${symbolName}/USDC`,
            type: 'crypto',
            session: '24x7',
            timezone: 'Etc/UTC',
            exchange: '',
            minmov: 1,
            pricescale: 100,
            has_intraday: true,
            has_empty_bars: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        }))
    },
    getBars: (symbolInfo: any, resolution: string, periodParams: { from: number, to: number, countBack: number }, onHistoryCallback: Function, onErrorCallback: Function) => {
        console.log('[getBars]: Method call', symbolInfo, resolution, periodParams);
        fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/ohlc/${token.network}/${token.address}/${periodParams.from * 1000}/${periodParams.to * 1000}/${resolution}/${periodParams.countBack}`)
            .then(x => x.json())
            .then((data) => {
                setTimeout(() => onHistoryCallback(data.bars, { noData: data.bars.length === 0 }));
            })
    },
    subscribeBars: (symbolInfo: any, resolution: string, onRealtimeCallback: Function, subscriberUID: string, onResetCacheNeededCallback: Function) => {
        console.log('[subscribeBars]: Method call with subscriberUID:', subscriberUID);
    },
    unsubscribeBars: (subscriberUID: string) => {
        console.log('[unsubscribeBars]: Method call with subscriberUID:', subscriberUID);
    },
});
