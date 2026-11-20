import { motion } from 'framer-motion';
import { LuChartColumn } from 'react-icons/lu';
import { useI18n } from '@/i18n/I18nProvider';
import { addDays, fromKey } from '@/lib/date';
import { weekSummary, weightChange } from '@/lib/nutrition';

function Stat({ label, value, hint, tone = '' }) {
    return (
        <div className="rounded-xl border border-line bg-ink-900/60 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{label}</p>
            <p className={`mt-1 font-display text-2xl font-semibold ${tone}`}>{value}</p>
            {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
        </div>
    );
}

export default function WeekPanel({ nutrition, plan, endDate }) {
    const { t } = useI18n();
    const summary = weekSummary(nutrition, endDate);
    const startDate = addDays(endDate, -6);
    const scale = weightChange(nutrition, startDate, endDate);
    const ceiling = Math.max(plan.tdee, plan.target, ...summary.rows.map((row) => row.eaten)) * 1.1;
    const signed = (value) => `${value > 0 ? '+' : ''}${value}`;

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
                <LuChartColumn className="text-brand-400" />
                {t('nutrition.week.title')}
            </h2>
            <p className="mb-5 text-sm text-muted">{t('nutrition.week.hint')}</p>

            <div className="relative mb-6 flex h-44 items-end gap-2">
                <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-brand-400/60" style={{ bottom: `${(plan.target / ceiling) * 100}%` }}>
                    <span className="absolute -top-4 right-0 font-mono text-[10px] text-brand-300">{t('nutrition.week.targetLine', { n: plan.target })}</span>
                </div>
                <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-white/20" style={{ bottom: `${(plan.tdee / ceiling) * 100}%` }}>
                    <span className="absolute -top-4 left-0 font-mono text-[10px] text-faint">{t('nutrition.week.tdeeLine', { n: plan.tdee })}</span>
                </div>
                {summary.rows.map((row) => {
                    const over = row.eaten > row.target;
                    return (
                        <div key={row.key} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-1.5" title={row.logged ? `${Math.round(row.eaten)} kcal` : '—'}>
                            <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-ink-800">
                                {row.logged && (
                                    <motion.div
                                        className={`absolute inset-x-0 bottom-0 rounded-t-md ${over ? 'bg-amber-400' : 'bg-brand-500'}`}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${(row.eaten / ceiling) * 100}%` }}
                                        transition={{ duration: 0.6 }}
                                    />
                                )}
                            </div>
                            <span className="font-mono text-[11px] text-faint">{fromKey(row.key).getDate()}</span>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
                <Stat
                    label={t('nutrition.week.avgDeficit')}
                    value={summary.averageDeficit == null ? '—' : `${signed(summary.averageDeficit)} kcal`}
                    hint={t('nutrition.week.logged', { n: summary.loggedDays })}
                    tone={summary.averageDeficit == null ? '' : summary.averageDeficit > 0 ? 'text-brand-300' : 'text-danger'}
                />
                <Stat label={t('nutrition.week.estLoss')} value={summary.loggedDays ? `${summary.estimatedKg >= 0 ? '−' : '+'}${Math.abs(summary.estimatedKg).toFixed(2)} kg` : '—'} hint={t('nutrition.week.estHint')} />
                <Stat
                    label={t('nutrition.week.scale')}
                    value={scale ? `${scale.kg > 0 ? '+' : scale.kg < 0 ? '−' : ''}${Math.abs(scale.kg).toFixed(1)} kg` : '—'}
                    hint={scale ? t('nutrition.week.scaleDays', { n: scale.days }) : t('nutrition.week.scaleNone')}
                />
            </div>
        </motion.section>
    );
}
