import { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import DayPlan from '@/components/dashboard/DayPlan';
import { useI18n } from '@/i18n/I18nProvider';
import { useJournal } from '@/store/journalStore';
import { dayRatio, dayStatus } from '@/lib/stats';
import { formatLongDate, fromKey, monthMatrix, todayKey } from '@/lib/date';

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0];

function cellTone(ratio) {
    if (ratio == null) {
        return 'bg-ink-900/40';
    }
    if (ratio >= 1) {
        return 'bg-brand-500/30';
    }
    if (ratio >= 0.5) {
        return 'bg-brand-500/15';
    }
    return ratio > 0 ? 'bg-brand-500/5' : 'bg-danger/10';
}

export default function CalendarPage() {
    const { t } = useI18n();
    const journal = useJournal();
    const today = todayKey();
    const [selected, setSelected] = useState(today);
    const [cursor, setCursor] = useState(() => {
        const date = new Date();
        return { year: date.getFullYear(), month: date.getMonth() };
    });
    const [direction, setDirection] = useState(0);
    const planRef = useRef(null);

    const cells = monthMatrix(cursor.year, cursor.month);

    const shiftMonth = (amount) => {
        setDirection(amount);
        setCursor(({ year, month }) => {
            const date = new Date(year, month + amount, 1);
            return { year: date.getFullYear(), month: date.getMonth() };
        });
    };

    const goToday = () => {
        const date = new Date();
        setDirection(0);
        setCursor({ year: date.getFullYear(), month: date.getMonth() });
        setSelected(today);
    };

    const select = (key) => {
        setSelected(key);
        requestAnimationFrame(() => planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    };

    return (
        <div>
            <PageHeader title={t('calendar.title')} subtitle={t('calendar.subtitle')} />

            <div className="card mb-10 p-4 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-display text-xl font-semibold">
                        {t('months')[cursor.month]} <span className="text-faint">{cursor.year}</span>
                    </h2>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={goToday} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-brand-500/50 hover:text-white">
                            {t('calendar.today')}
                        </button>
                        <button type="button" aria-label="Previous month" onClick={() => shiftMonth(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white">
                            <LuChevronLeft />
                        </button>
                        <button type="button" aria-label="Next month" onClick={() => shiftMonth(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white">
                            <LuChevronRight />
                        </button>
                    </div>
                </div>

                <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold uppercase tracking-wider text-faint">
                    {WEEK_ORDER.map((weekday) => <span key={weekday}>{t('weekdays.short')[weekday]}</span>)}
                </div>

                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={`${cursor.year}-${cursor.month}`}
                        custom={direction}
                        initial={{ opacity: 0, x: direction * 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: direction * -40 }}
                        transition={{ duration: 0.22 }}
                        className="grid grid-cols-7 gap-1.5"
                    >
                        {cells.map((key) => {
                            const date = fromKey(key);
                            const inMonth = date.getMonth() === cursor.month;
                            const ratio = dayRatio(journal, key, today);
                            const status = dayStatus(journal, key);
                            const hasNote = Boolean(journal.days[key]?.note);
                            const isSelected = key === selected;
                            const isToday = key === today;

                            return (
                                <motion.button
                                    key={key}
                                    type="button"
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => select(key)}
                                    className={`relative flex aspect-square flex-col items-start justify-between rounded-xl border p-1.5 text-left transition sm:aspect-[1.15] sm:p-2.5 ${cellTone(ratio)} ${isSelected ? 'border-brand-400 ring-2 ring-brand-500/30' : isToday ? 'border-brand-500/60' : 'border-line hover:border-line-strong'} ${inMonth ? '' : 'opacity-35'}`}
                                >
                                    <span className={`font-mono text-xs sm:text-sm ${isToday ? 'grid h-6 w-6 place-items-center rounded-full bg-brand-500 font-bold text-ink-950' : 'text-white'}`}>
                                        {date.getDate()}
                                    </span>
                                    <span className="hidden w-full sm:block">
                                        {ratio != null && (
                                            <span className="block font-mono text-[11px] text-muted">{status.mandatoryDone}/{status.mandatoryTotal}</span>
                                        )}
                                        <span className="mt-1 block h-1 w-full overflow-hidden rounded-full bg-white/5">
                                            <span className="block h-full rounded-full bg-brand-500" style={{ width: `${Math.round((ratio ?? 0) * 100)}%` }} />
                                        </span>
                                    </span>
                                    {hasNote && <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white/70" />}
                                </motion.button>
                            );
                        })}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-faint">
                    <span>{t('calendar.legend')}:</span>
                    {[['bg-danger/10', '0%'], ['bg-brand-500/5', '1–49%'], ['bg-brand-500/15', '50–99%'], ['bg-brand-500/30', '100%'], ['bg-ink-900/40', t('calendar.none')]].map(([tone, label]) => (
                        <span key={label} className="flex items-center gap-1.5">
                            <span className={`h-3 w-3 rounded border border-line ${tone}`} />
                            {label}
                        </span>
                    ))}
                </div>
            </div>

            <div ref={planRef} className="scroll-mt-20">
                <h2 className="mb-6 font-display text-2xl font-semibold">{formatLongDate(selected, t)}</h2>
                <AnimatePresence mode="wait">
                    <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        <DayPlan date={selected} />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
