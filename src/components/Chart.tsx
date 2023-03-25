import { datafeed } from '@/helpers/datafeed';
import { Token } from '@/types';
import React, { useEffect, useRef } from 'react';
import { setTimeout } from 'timers';

const applyOverrides = (tv: any) => {
    try {
        tv?.applyOverrides?.({
            // @ts-ignore
            'paneProperties.backgroundType': "solid",
            "paneProperties.background": "#18181B"
        })
    } catch (e) { }
}

export const Chart = (props: { token: Token }) => {    
    useEffect(() => {
        // @ts-ignore
        const tv = new TradingView.widget({
            // debug: true,

            symbol: props.token.symbol, // default symbol
            // @ts-ignore
            interval: '1D', // default interval
            autosize: true, // displays the chart in the fullscreen mode
            theme: 'Dark',
            disabled_features: ["header_symbol_search", "symbol_search_hot_key", "header_compare"],
            custom_css_url: '/custom_chart.css',
            custom_font_family: '\'Space Mono\'',
            toolbar_bg: '#18181B',
            loading_screen: { backgroundColor: "#18181B" },
            overrides: {
                'paneProperties.backgroundType': "solid",
                "paneProperties.background": "#ffffff"
            },
            datafeed: datafeed(props.token),
            library_path: '/charting_library/',
            container: 'tv_chart_container',
        });

        // Set the bg color in a couple of steps so it always works regarding of the user internet speed
        setTimeout(() => {
            applyOverrides(tv)
        }, 200)

        setTimeout(() => {
            applyOverrides(tv)
        }, 800)

        setTimeout(() => {
            applyOverrides(tv)
        }, 1500)

        setTimeout(() => {
            applyOverrides(tv)
        }, 3000)

        setTimeout(() => {
            applyOverrides(tv)
        }, 7000)
    }, [props.token])

    return (
        <div
            className="h-full w-full"
            id="tv_chart_container"
        />
    );
};
