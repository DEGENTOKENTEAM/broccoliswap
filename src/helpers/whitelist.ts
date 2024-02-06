type Whitelist = {
    secure: boolean;
}

export const whitelistedTokens: Record<number, Record<string, Whitelist>> = {
    1: {
        '0x0000000000300dd8b0230efcfef136ecdf6abcde': {
            secure: true,
        }
    },
    43114: {
        '0x51e48670098173025c477d9aa3f0eff7bf9f7812': {
            secure: true,
        }
    }
};
