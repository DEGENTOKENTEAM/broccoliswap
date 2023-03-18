import { datafeed } from '@/helpers/datafeed';
import React, { useEffect, useRef } from 'react';
import { setTimeout } from 'timers';

export const Chart = (props: any) => {    
    useEffect(() => {
        // @ts-ignore
        const tv = new TradingView.widget({
            symbol: 'DGNX/USDC', // default symbol
            // @ts-ignore
            interval: '1H', // default interval
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
            datafeed,
            library_path: '/charting_library/charting_library/',
            container: 'tv_chart_container',
        });

        // Set the bg color in a couple of steps so it always works regarding of the user internet speed
        setTimeout(() => {
            tv.applyOverrides({
                // @ts-ignore
                'paneProperties.backgroundType': "solid",
                "paneProperties.background": "#18181B"
            })
        }, 200)

        setTimeout(() => {
            tv.applyOverrides({
                // @ts-ignore
                'paneProperties.backgroundType': "solid",
                "paneProperties.background": "#18181B"
            })
        }, 800)

        setTimeout(() => {
            tv.applyOverrides({
                // @ts-ignore
                'paneProperties.backgroundType': "solid",
                "paneProperties.background": "#18181B"
            })
        }, 1500)

        setTimeout(() => {
            tv.applyOverrides({
                // @ts-ignore
                'paneProperties.backgroundType': "solid",
                "paneProperties.background": "#18181B"
            })
        }, 3000)

        setTimeout(() => {
            tv.applyOverrides({
                // @ts-ignore
                'paneProperties.backgroundType': "solid",
                "paneProperties.background": "#18181B"
            })
        }, 7000)
    }, [])

    const chartContainerRef = useRef<any>();

    return (
        <div
            className="h-full w-full"
            id="tv_chart_container"
        />
    );
};
