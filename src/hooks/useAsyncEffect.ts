import { useEffect } from 'react';

export const useAsyncEffect = (callback: () => Promise<void> | void | Function, deps: any[]) => {
    useEffect(() => {
        callback();
    }, [...deps]);
};
