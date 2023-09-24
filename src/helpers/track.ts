export const trackSwap = (data: {
    address: string;
    inputToken: string;
    inputTokenAddress: string;
    inputChain: string;
    outputToken: string;
    outputTokenAddress: string;
    outputChain: string;
    amountIn: number;
    amountInUsd: number;
    amountOut: number;
    amountOutUsd: number;
    revenue: number;
    revenueInUsd: number;
}) => {
    const { firstTouchUTM, lastTouchUTM } = getUTMTags();
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/track`, {
        method: 'post',
        body: JSON.stringify({ name: 'Trade', data: {
            ...data,
            ...firstTouchUTM,
            ...lastTouchUTM,
        } }),
    });
};

export const trackStartVisit = () => {
    const { firstTouchUTM, lastTouchUTM } = getUTMTags();
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/track`, {
        method: 'post',
        body: JSON.stringify({ name: 'Start Visit', data: {
            ...firstTouchUTM,
            ...lastTouchUTM,
        } }),
    });
}
const getUTMTags = () => {
    // First touch UTM parameters
    const firstTouchUTMStore = localStorage?.getItem('firstTouchUTM');
    let firstTouchUTM = {};
    if (firstTouchUTMStore) {
        firstTouchUTM = JSON.parse(firstTouchUTMStore);
    }

    // Last touch UTM parameters
    const lastTouchUTMStore = sessionStorage?.getItem('lastTouchUTM');
    let lastTouchUTM = {};
    if (lastTouchUTMStore) {
        const lastTouchUTMParams = JSON.parse(lastTouchUTMStore);
        // Overwrite key names
        lastTouchUTM = Object.entries(lastTouchUTMParams).reduce((acc, [utmKey, value]) => {
            acc[`${utmKey} [last touch]`] = value;
            return acc;
        }, {} as Record<string, unknown>);
    }

    return { firstTouchUTM, lastTouchUTM };
};

export const setUTMParameters = (params: URLSearchParams) => {
    const utmParams = {
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        utm_term: params.get('utm_term'),
        utm_content: params.get('utm_content'),
        referrer: document?.referrer,
    };
    // Check if any are set
    if (Object.values(utmParams).some((param) => !!param)) {
        // First touch should only be set when it is not yet set in the localStorage.
        if (!localStorage?.getItem('firstTouchUTM')) {
            localStorage?.setItem('firstTouchUTM', JSON.stringify(utmParams));
        }

        // Last touch should only be set when it is not yet set in the sessionStorage.
        if (!sessionStorage?.getItem('lastTouchUTM')) {
            sessionStorage?.setItem('lastTouchUTM', JSON.stringify(utmParams));
        }
    }
};
