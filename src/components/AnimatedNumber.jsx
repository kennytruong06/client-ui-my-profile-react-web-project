import { useEffect } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'framer-motion';

export default function AnimatedNumber({ value, decimals = 0, suffix = '' }) {
    const motionValue = useMotionValue(0);
    const text = useTransform(motionValue, (latest) => `${latest.toFixed(decimals)}${suffix}`);

    useEffect(() => {
        const controls = animate(motionValue, value, { duration: 0.9, ease: [0.22, 1, 0.36, 1] });
        return () => controls.stop();
    }, [motionValue, value]);

    return <motion.span>{text}</motion.span>;
}
