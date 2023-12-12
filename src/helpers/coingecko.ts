const coinsCache: Record<string, any> = {}

let getCoinPromise: Record<string, Promise<any> | undefined> = {};
export const getTokenInfo = async (id: string) => {
    if (coinsCache[id]) {
        return coinsCache[id]
    }
    if (!getCoinPromise[id]) {
        getCoinPromise[id] = new Promise(resolve =>
            fetch(`https://api.coingecko.com/api/v3/coins/${id}`)
                .then(x => x.json())
                .then(data => resolve(data))
        );
    }
    const data = await getCoinPromise[id];
    getCoinPromise[id] = undefined;

    coinsCache[data.id] = data;
    return data
}
