import { useCallback, useEffect, useRef, useState } from 'react';

const TICK_MS = 250;

export default function useCountdown(totalSeconds) {
    const totalMs = totalSeconds * 1000;
    const [status, setStatus] = useState('idle');
    const [remainingMs, setRemainingMs] = useState(totalMs);
    const endAt = useRef(0);

    useEffect(() => {
        setStatus('idle');
        setRemainingMs(totalMs);
    }, [totalMs]);

    useEffect(() => {
        if (status !== 'running') {
            return undefined;
        }
        const timer = setInterval(() => {
            const left = Math.max(endAt.current - Date.now(), 0);
            setRemainingMs(left);
            if (left === 0) {
                setStatus('done');
            }
        }, TICK_MS);
        return () => clearInterval(timer);
    }, [status]);

    const start = useCallback(() => {
        const from = status === 'done' ? totalMs : remainingMs;
        endAt.current = Date.now() + from;
        setRemainingMs(from);
        setStatus('running');
    }, [status, remainingMs, totalMs]);

    const pause = useCallback(() => {
        setRemainingMs(Math.max(endAt.current - Date.now(), 0));
        setStatus('paused');
    }, []);

    const reset = useCallback(() => {
        setStatus('idle');
        setRemainingMs(totalMs);
    }, [totalMs]);

    return { status, remainingMs, totalMs, start, pause, reset };
}
