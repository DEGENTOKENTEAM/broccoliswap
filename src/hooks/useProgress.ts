import { useEffect, useState } from "react";
import { useAsyncEffect } from "./useAsyncEffect";

const timesPerSec = 10

export const useProgress = (cb: () => Promise<void> | void, maxTimeInSeconds = 300) => {
    const [elapsedTime, setElapsedTime] = useState(0);
    const [progress, setProgress] = useState(0);

    const click = async () => {
        await cb()
        setProgress(0)
        setElapsedTime(0)
    }

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (progress < 1) {
                setElapsedTime(t => t + 1 / timesPerSec);
            }
        }, Math.floor(1000 / timesPerSec));

        return () => clearInterval(intervalId);
    }, []);

    useAsyncEffect(async () => {
        let curProgress = elapsedTime / maxTimeInSeconds
        if (elapsedTime / maxTimeInSeconds > 1) {
            await cb()
            curProgress = 0
            setElapsedTime(0)
            setProgress(curProgress);
        } else {
            setProgress(curProgress);
        }
    }, [elapsedTime]);

    return { progress, click };
};
