import { motion } from 'framer-motion';

export default function BarList({ items, max }) {
    const ceiling = max ?? Math.max(1, ...items.map((item) => item.value));

    return (
        <ul className="space-y-3">
            {items.map((item, index) => (
                <li key={item.key} className="group" title={item.tooltip}>
                    <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <span className="flex items-center gap-2 text-white">
                            {item.icon}
                            {item.label}
                        </span>
                        <span className="font-mono text-muted">{item.display}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                        <motion.div
                            className="h-full rounded-full bg-brand-500 transition-colors group-hover:bg-brand-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.value / ceiling) * 100}%` }}
                            transition={{ delay: index * 0.06, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}
