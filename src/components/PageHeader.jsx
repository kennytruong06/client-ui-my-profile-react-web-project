import { motion } from 'framer-motion';

export default function PageHeader({ eyebrow, title, subtitle, action }) {
    return (
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                {eyebrow && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-brand-400">
                        {eyebrow}
                    </motion.p>
                )}
                <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
                {subtitle && <p className="mt-2 max-w-2xl text-muted">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}
