import { useState } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';
import { addDays, weekdayOf } from '@/lib/date';

const WEEKS = 16;
const STEPS = ['var(--color-ink-800)', '#14532d', '#15803d', '#22c55e', '#86efac'];

function stepFor(ratio) {
    if (ratio == null) {
        return null;
    }
    if (ratio === 0) {
        return 0;
    }
    if (ratio < 0.5) {
        return 1;
    }
    if (ratio < 0.85) {
        return 2;
    }
    return ratio < 1 ? 3 : 4;
}

export default function Heatmap({ today, ratioOf }) {
    const { t } = useI18n();
    const [hover, setHover] = useState(null);
    const lastMonday = addDays(today, -((weekdayOf(today) + 6) % 7));
    const firstMonday = addDays(lastMonday, -(WEEKS - 1) * 7);
    const columns = Array.from({ length: WEEKS }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(firstMonday, week * 7 + day)));

    return (
        <div>
            <div className="flex gap-1 overflow-x-auto pb-1">
                {columns.map((column, columnIndex) => (
                    <div key={columnIndex} className="flex flex-col gap-1">
                        {column.map((key, rowIndex) => {
                            const ratio = key > today ? null : ratioOf(key);
                            const step = stepFor(ratio);
                            return (
                                <motion.span
                                    key={key}
                                    initial={{ opacity: 0, scale: 0.4 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: (columnIndex * 7 + rowIndex) * 0.004 }}
                                    onMouseEnter={() => setHover({ key, ratio })}
                                    onMouseLeave={() => setHover(null)}
                                    className={`h-3.5 w-3.5 rounded-[4px] sm:h-4 sm:w-4 ${step == null ? 'border border-line' : ''}`}
                                    style={{ background: step == null ? 'transparent' : STEPS[step] }}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-faint">
                <span className="font-mono">
                    {hover ? `${hover.key} · ${hover.ratio == null ? t('calendar.none') : `${Math.round(hover.ratio * 100)}%`}` : ' '}
                </span>
                <span className="flex items-center gap-1">
                    {t('progress.heatmapLess')}
                    {STEPS.map((color) => <span key={color} className="h-3 w-3 rounded-[3px]" style={{ background: color }} />)}
                    {t('progress.heatmapMore')}
                </span>
            </div>
        </div>
    );
}
