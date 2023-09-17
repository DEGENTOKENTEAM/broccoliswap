export const trackSwap = (data: {
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
}) => {
    return fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT}/trade`, {
        method: 'post',
        body: JSON.stringify(data),
    });
};
