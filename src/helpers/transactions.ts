let recentTransactionsPromise: Promise<any> | undefined;
export const getRecentTransactions = async (network: string, tokenAddress: string) => {
    if (!recentTransactionsPromise) {
        recentTransactionsPromise = new Promise(resolve =>
            fetch(`${process.env.NEXT_PUBLIC_BACKEND_ENDPOINT!}/transactions/${network}/${tokenAddress}`)
                .then(x => x.json())
                .then(data => resolve(data.transactions))
        );
    }
    const data = await recentTransactionsPromise;
    recentTransactionsPromise = undefined;

    return data
}
