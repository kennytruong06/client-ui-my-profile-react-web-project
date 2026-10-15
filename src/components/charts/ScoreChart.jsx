import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';

const DEFAULT_WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 16, right: 16, bottom: 28, left: 32 };
const SERIES = [
    { key: 'listening', label: 'Listening', color: 'var(--color-brand-500)' },
    { key: 'reading', label: 'Reading', color: '#e4e4e7' },
];

function scaleX(day, width) {
    return PAD.left + ((day - 1) / 59) * (width - PAD.left - PAD.right);
}

function scaleY(score) {
    return PAD.top + (1 - score / 40) * (HEIGHT - PAD.top - PAD.bottom);
}

function toPath(points, width) {
    return points.map((point, index) => `${index ? 'L' : 'M'}${scaleX(point.day, width)},${scaleY(point.value)}`).join(' ');
}

export default function ScoreChart({ points }) {
    const { t } = useI18n();
    const [hover, setHover] = useState(null);
    const [node, setNode] = useState(null);
    const [width, setWidth] = useState(DEFAULT_WIDTH);
    const x = (day) => scaleX(day, width);

    useEffect(() => {
        if (!node) {
            return undefined;
        }
        const observer = new ResizeObserver(([entry]) => setWidth(Math.max(280, Math.round(entry.contentRect.width))));
        observer.observe(node);
        return () => observer.disconnect();
    }, [node]);

    const days = [...new Set(points.map((point) => point.day))].sort((a, b) => a - b);

    if (days.length === 0) {
        return <p className="rounded-xl border border-dashed border-line p-8 text-center text-sm text-muted">{t('english.chartEmpty')}</p>;
    }

    const handleMove = (event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * width;
        const nearest = days.reduce((best, day) => (Math.abs(x(day) - x) < Math.abs(x(best) - x) ? day : best), days[0]);
        setHover(nearest);
    };

    const hoverValues = hover ? SERIES.map((series) => ({ ...series, value: points.find((point) => point.day === hover && point.series === series.key)?.value })) : [];

    return (
        <div>
            <div className="mb-3 flex flex-wrap gap-4 text-xs text-muted">
                {SERIES.map((series) => (
                    <span key={series.key} className="flex items-center gap-2">
                        <span className="h-0.5 w-4 rounded" style={{ background: series.color }} />
                        {series.label}
                    </span>
                ))}
            </div>
            <div ref={setNode} className="relative">
                <svg viewBox={`0 0 ${width} ${HEIGHT}`} className="w-full" onMouseMove={handleMove} onMouseLeave={() => setHover(null)} role="img" aria-label={t('english.chartTitle')}>
                    {[0, 10, 20, 30, 40].map((tick) => (
                        <g key={tick}>
                            <line x1={PAD.left} x2={width - PAD.right} y1={scaleY(tick)} y2={scaleY(tick)} stroke="rgb(255 255 255 / 0.06)" />
                            <text x={PAD.left - 8} y={scaleY(tick) + 4} textAnchor="end" className="fill-faint text-[10px]">{tick}</text>
                        </g>
                    ))}
                    {[1, 15, 30, 45, 60].map((tick) => (
                        <text key={tick} x={x(tick)} y={HEIGHT - 8} textAnchor="middle" className="fill-faint text-[10px]">{tick}</text>
                    ))}
                    {hover && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={HEIGHT - PAD.bottom} stroke="rgb(255 255 255 / 0.2)" strokeDasharray="3 3" />}
                    {SERIES.map((series) => {
                        const seriesPoints = points.filter((point) => point.series === series.key).sort((a, b) => a.day - b.day);
                        return (
                            <g key={series.key}>
                                {seriesPoints.length > 1 && (
                                    <motion.path
                                        d={toPath(seriesPoints, width)}
                                        fill="none"
                                        stroke={series.color}
                                        strokeWidth={2}
                                        strokeLinejoin="round"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 1.1, ease: 'easeInOut' }}
                                    />
                                )}
                                {seriesPoints.map((point) => (
                                    <circle key={point.day} cx={x(point.day)} cy={scaleY(point.value)} r={hover === point.day ? 6 : 4} fill={series.color} stroke="var(--color-ink-900)" strokeWidth={2} />
                                ))}
                            </g>
                        );
                    })}
                </svg>
                {hover && (
                    <div
                        className="pointer-events-none absolute top-2 rounded-lg border border-line-strong bg-ink-850 px-3 py-2 text-xs shadow-xl"
                        style={{ left: `${(x(hover) / width) * 100}%`, transform: x(hover) > width / 2 ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }}
                    >
                        <p className="mb-1 font-semibold text-white">{t('english.tableDay')} {hover}</p>
                        {hoverValues.map((series) => (
                            <p key={series.key} className="flex items-center gap-2 text-muted">
                                <span className="h-2 w-2 rounded-full" style={{ background: series.color }} />
                                {series.label}: <span className="font-mono text-white">{series.value ?? '—'}/40</span>
                            </p>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
