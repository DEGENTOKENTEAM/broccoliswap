const coinsCache: Record<string, any> = {}

let getCoinPromise: Promise<any> | undefined;
export const getTokenInfo = async (id: string) => {
    if (coinsCache[id]) {
        return coinsCache[id]
    }
    if (!getCoinPromise) {
        getCoinPromise = new Promise(resolve =>
            fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
                .then(x => x.json())
                .then(data => resolve(data))
        );
    }
    const data = await getCoinPromise;
    getCoinPromise = undefined;

    coinsCache[data.id] = data;
    return data
}
