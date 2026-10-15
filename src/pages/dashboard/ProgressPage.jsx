import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCircleAlert, LuFlame, LuSparkles, LuTarget, LuTrophy } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import ProgressRing from '@/components/charts/ProgressRing';
import BarList from '@/components/charts/BarList';
import Heatmap from '@/components/charts/Heatmap';
import AnimatedNumber from '@/components/AnimatedNumber';
import CategoryIcon from '@/components/CategoryIcon';
import { useI18n } from '@/i18n/I18nProvider';
import { useJournal } from '@/store/journalStore';
import { computeStats, dayRatio, streaks, verdictKey } from '@/lib/stats';
import { addDays, todayKey } from '@/lib/date';
import { CATEGORIES } from '@/data/schedule';

const RANGES = { week: 7, month: 30, all: null };
const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function Panel({ title, hint, children, className = '', delay = 0 }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`card p-5 sm:p-6 ${className}`}
        >
            <h2 className="font-display font-semibold">{title}</h2>
            {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
            <div className="mt-5">{children}</div>
        </motion.section>
    );
}

function Kpi({ icon: Icon, label, children, delay }) {
    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card p-5">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
                <Icon size={14} className="text-brand-400" />
                {label}
            </p>
            <div className="mt-3 font-display text-3xl font-semibold">{children}</div>
        </motion.div>
    );
}

function percent(done, planned) {
    return planned ? Math.round((done / planned) * 100) : 0;
}

export default function ProgressPage() {
    const { t, tx } = useI18n();
    const journal = useJournal();
    const today = todayKey();
    const [range, setRange] = useState('month');
    const rangeStart = RANGES[range] ? addDays(today, -(RANGES[range] - 1)) : journal.trackingStart;
    const stats = computeStats(journal, rangeStart, today);
    const { current, best } = streaks(journal, today);
    const verdict = verdictKey(stats.discipline);

    const hours = CATEGORIES.map((category) => ({
        key: category,
        label: t(`categories.${category}`),
        icon: <CategoryIcon category={category} size={14} className="text-brand-400" />,
        value: stats.byCategory[category].minutes,
        display: t('common.hours', { n: +(stats.byCategory[category].minutes / 60).toFixed(1) }),
    }));

    const completion = CATEGORIES.map((category) => {
        const bucket = stats.byCategory[category];
        return {
            key: category,
            label: t(`categories.${category}`),
            icon: <CategoryIcon category={category} size={14} className="text-brand-400" />,
            value: percent(bucket.done, bucket.planned),
            display: `${percent(bucket.done, bucket.planned)}% · ${bucket.done}/${bucket.planned}`,
        };
    });

    return (
        <div>
            <PageHeader
                eyebrow={t('progress.trackingSince', { date: journal.trackingStart })}
                title={t('progress.title')}
                subtitle={t('progress.subtitle')}
                action={(
                    <div className="flex w-max gap-1 rounded-xl border border-line bg-ink-900 p-1">
                        {Object.keys(RANGES).map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setRange(key)}
                                className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${range === key ? 'text-ink-950' : 'text-muted hover:text-white'}`}
                            >
                                {range === key && <motion.span layoutId="range-pill" className="absolute inset-0 rounded-lg bg-brand-500" />}
                                <span className="relative">{t(`progress.range.${key}`)}</span>
                            </button>
                        ))}
                    </div>
                )}
            />

            <div className="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                <motion.section initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card relative flex flex-col items-center gap-6 overflow-hidden p-6 text-center sm:flex-row sm:text-left">
                    <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-brand-500/20 blur-3xl" />
                    <ProgressRing value={stats.discipline ?? 0} size={136} stroke={12} label={t('progress.discipline')}>
                        <span className="font-display text-3xl font-semibold">
                            {stats.discipline == null ? '—' : <AnimatedNumber value={stats.discipline * 100} suffix="%" />}
                        </span>
                    </ProgressRing>
                    <div className="relative">
                        <p className="text-xs font-semibold uppercase tracking-wider text-faint">{t('progress.discipline')}</p>
                        <p className="mt-2 font-display text-xl font-semibold text-white">{t(`progress.verdict.${verdict}`)}</p>
                        <p className="mt-2 text-sm text-muted">{t('progress.disciplineHint')}</p>
                        <p className="mt-3 font-mono text-sm text-muted">
                            <span className="text-brand-400">{stats.totals.mandatoryDone}</span> {t('common.done').toLowerCase()} · <span className="text-danger">{stats.totals.mandatorySkipped}</span> {t('common.skipped').toLowerCase()} · {stats.totals.mandatoryMissed} {t('common.pending').toLowerCase()}
                        </p>
                    </div>
                </motion.section>

                <div className="grid grid-cols-2 gap-4">
                    <Kpi icon={LuFlame} label={t('progress.streak')} delay={0.05}>
                        <AnimatedNumber value={current} /> <span className="text-base text-faint">{t('progress.daysUnit')}</span>
                    </Kpi>
                    <Kpi icon={LuTrophy} label={t('progress.bestStreak')} delay={0.1}>
                        <AnimatedNumber value={best} /> <span className="text-base text-faint">{t('progress.daysUnit')}</span>
                    </Kpi>
                    <Kpi icon={LuSparkles} label={t('progress.optional')} delay={0.15}>
                        {stats.totals.optionalDone}<span className="text-faint">/{stats.totals.optionalPlanned}</span>
                    </Kpi>
                    <Kpi icon={LuCircleAlert} label={t('progress.missedTitle')} delay={0.2}>
                        <span className={stats.totals.mandatoryMissed ? 'text-danger' : ''}>{stats.totals.mandatoryMissed}</span>
                    </Kpi>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title={t('progress.categoryTitle')} delay={0.1}>
                    <BarList items={completion} max={100} />
                </Panel>

                <Panel title={t('progress.hoursTitle')} delay={0.15}>
                    <BarList items={hours} />
                </Panel>

                <Panel title={t('progress.weekdayTitle')} hint={t('progress.weekdayHint')} delay={0.2}>
                    <div className="flex h-44 items-end gap-2">
                        {WEEK_ORDER.map((weekday, index) => {
                            const bucket = stats.byWeekday[weekday];
                            const value = percent(bucket.done, bucket.planned);
                            return (
                                <div key={weekday} className="group flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${bucket.done}/${bucket.planned}`}>
                                    <span className="font-mono text-xs text-muted opacity-0 transition group-hover:opacity-100">{bucket.planned ? `${value}%` : '—'}</span>
                                    <div className="relative w-full flex-1 overflow-hidden rounded-t-md bg-ink-800">
                                        <motion.div
                                            className="absolute inset-x-0 bottom-0 rounded-t-md bg-brand-500 group-hover:bg-brand-400"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${value}%` }}
                                            transition={{ delay: index * 0.05, duration: 0.7 }}
                                        />
                                    </div>
                                    <span className="text-xs text-faint">{t('weekdays.short')[weekday]}</span>
                                </div>
                            );
                        })}
                    </div>
                </Panel>

                <Panel title={t('progress.heatmapTitle')} hint={t('calendar.legend')} delay={0.25}>
                    <Heatmap today={today} ratioOf={(key) => dayRatio(journal, key, today)} />
                </Panel>

                <Panel title={t('progress.reasonsTitle')} className="lg:col-span-2" delay={0.3}>
                    {stats.skips.length === 0 ? (
                        <p className="flex items-center gap-2 text-sm text-muted">
                            <LuTarget className="text-brand-400" />
                            {t('progress.reasonsEmpty')}
                        </p>
                    ) : (
                        <ul className="divide-y divide-line">
                            {stats.skips.map((skip) => (
                                <li key={`${skip.date}-${skip.task.id}`} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
                                    <span className="w-24 shrink-0 font-mono text-xs text-faint">{skip.date}</span>
                                    <span className="flex shrink-0 items-center gap-2 text-sm text-white sm:w-72">
                                        <CategoryIcon category={skip.task.category} size={14} className="text-brand-400" />
                                        {tx(skip.task.title)}
                                    </span>
                                    <span className={`text-sm ${skip.note ? 'text-muted' : 'italic text-danger'}`}>{skip.note || t('day.reasonRequired')}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>
            </div>
        </div>
    );
}
