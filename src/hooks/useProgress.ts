import { useEffect, useState } from "react";

const timesPerSec = 10

export const useProgress = (cb: () => Promise<void>, maxTimeInSeconds = 300) => {
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

    useEffect(() => {
        let curProgress = elapsedTime / maxTimeInSeconds
        if (elapsedTime / maxTimeInSeconds > 1) {
            cb().then(() => {
                curProgress = 0
                setElapsedTime(0)
                setProgress(curProgress);
            });
        } else {
            setProgress(curProgress);
        }
    }, [elapsedTime]);

    return { progress, click };
};
