export const createReturn = (statusCode: number, body: string, cacheMaxAge: number = 0) => {
    const cacheHeader: Record<string, string> = {}
    if (cacheMaxAge > 0) {
        cacheHeader['cache-control'] = `public, max-age=${cacheMaxAge}`
    }

    return {
        statusCode,
        body,
        headers: {
            'Access-Control-Allow-Origin': process.env.CORS_ALLOWED_ORIGIN!,
            "Access-Control-Allow-Credentials": true,
            ...cacheHeader
        }
    }
}
