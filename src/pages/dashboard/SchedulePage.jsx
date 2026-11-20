import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuBriefcase, LuCheck, LuChevronLeft, LuChevronRight, LuMoon, LuSunrise, LuUtensils } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import CategoryIcon from '@/components/CategoryIcon';
import useNow from '@/hooks/useNow';
import { useI18n } from '@/i18n/I18nProvider';
import { sessionsMinutes, useJournal } from '@/store/journalStore';
import { BEDTIME, WAKE_TIME, tasksForDate } from '@/data/schedule';
import { addDays, formatDuration, fromKey, toKey, weekdayOf } from '@/lib/date';
import { dayStatus } from '@/lib/stats';
import { DAY_END, DAY_START, blocksForDate, formatClock, hourMarks } from '@/lib/timeline';

const WEEK_OFFSETS = [0, 1, 2, 3, 4, 5, 6];
const PX_PER_MINUTE = { week: 0.85, day: 1.3 };
const HEADER_HEIGHT = 68;
const HEADER_GAP = 8;

function mondayOf(key) {
    return addDays(key, -((weekdayOf(key) + 6) % 7));
}

function blockTone(block, status) {
    if (block.kind === 'work') {
        return 'border-white/15 bg-white/[0.06] text-muted';
    }
    if (block.kind === 'meal') {
        return 'border-amber-400/30 bg-amber-400/10 text-amber-200';
    }
    if (status === 'done') {
        return 'border-brand-400/60 bg-brand-500/25 text-white';
    }
    if (status === 'skipped') {
        return 'border-danger/30 bg-danger/10 text-muted line-through';
    }
    return block.task.mandatory ? 'border-brand-500/40 bg-brand-500/10 text-white' : 'border-dashed border-brand-500/30 bg-ink-900/70 text-muted';
}

function Block({ block, status, compact, ppm }) {
    const { t, tx } = useI18n();
    const title = block.kind === 'work' ? t('schedule.work') : block.kind === 'meal' ? t(`schedule.meals.${block.meal}`) : tx(block.task.title);
    const Icon = block.kind === 'work' ? LuBriefcase : block.kind === 'meal' ? LuUtensils : null;
    const height = Math.max(block.minutes * ppm - 2, 14);

    return (
        <div
            title={`${formatClock(block.start)}–${formatClock(block.start + block.minutes)} · ${title}`}
            className={`absolute overflow-hidden rounded-lg border px-1.5 py-1 ${blockTone(block, status)}`}
            style={{
                top: (block.start - DAY_START) * ppm + 1,
                height,
                left: `calc(${(block.lane / block.lanes) * 100}% + 1px)`,
                width: `calc(${100 / block.lanes}% - 2px)`,
            }}
        >
            <p className={`flex items-center gap-1 font-medium leading-tight ${compact ? 'text-[10px]' : 'text-xs sm:text-sm'}`}>
                {Icon ? <Icon size={compact ? 10 : 13} className="shrink-0" /> : <CategoryIcon category={block.task.category} size={compact ? 10 : 13} className="shrink-0 text-brand-400" />}
                <span className={compact ? 'line-clamp-2' : 'truncate'}>{title}</span>
                {status === 'done' && <LuCheck size={compact ? 10 : 14} strokeWidth={3} className="ml-auto shrink-0 text-brand-300" />}
            </p>
            {!compact && height > 34 && (
                <p className="mt-0.5 font-mono text-[11px] opacity-70">
                    {formatClock(block.start)}–{formatClock(block.start + block.minutes)} · {t('common.minutes', { n: block.minutes })}
                    {block.kind === 'task' && !block.task.mandatory && ` · ${t('common.optional').toLowerCase()}`}
                </p>
            )}
        </div>
    );
}

function NowLine({ ppm, now }) {
    const minutes = now.getHours() * 60 + now.getMinutes();
    if (minutes < DAY_START || minutes > DAY_END) {
        return null;
    }
    return (
        <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: (minutes - DAY_START) * ppm }}>
            <span className="h-2 w-2 shrink-0 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.9)]" />
            <span className="h-px flex-1 bg-orange-400/70" />
        </div>
    );
}

function DayColumn({ date, weekday, ppm, compact, journal, today, now, onOpen }) {
    const { t } = useI18n();
    const blocks = blocksForDate(date);
    const records = journal.days[date]?.tasks ?? {};
    const reveal = date <= today;
    const isToday = date === today;
    const status = dayStatus(journal, date);
    const height = (DAY_END - DAY_START) * ppm;

    return (
        <div className="min-w-0 flex-1">
            {compact && (
                <button
                    type="button"
                    onClick={() => onOpen(date)}
                    style={{ height: HEADER_HEIGHT, marginBottom: HEADER_GAP }}
                    className={`flex w-full flex-col items-center justify-center rounded-xl border px-1 transition hover:border-brand-500/50 ${isToday ? 'border-brand-500/60 bg-brand-500/10' : 'border-line'}`}
                >
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">{t('weekdays.short')[weekday]}</span>
                    <span className={`font-display text-lg font-semibold ${isToday ? 'text-brand-300' : ''}`}>{fromKey(date).getDate()}</span>
                    <span className="font-mono text-[10px] text-faint">{reveal ? `${status.mandatoryDone}/${status.mandatoryTotal}` : '·'}</span>
                </button>
            )}
            <div className="relative rounded-xl border border-line bg-ink-900/40" style={{ height }}>
                {hourMarks().map((minute) => (
                    <div key={minute} className="absolute inset-x-0 border-t border-white/[0.05]" style={{ top: (minute - DAY_START) * ppm }} />
                ))}
                {blocks.map((block) => (
                    <Block key={block.id} block={block} status={reveal && block.kind === 'task' ? records[block.task.id]?.status : null} compact={compact} ppm={ppm} />
                ))}
                {isToday && <NowLine ppm={ppm} now={now} />}
            </div>
        </div>
    );
}

function FlexibleRow({ dates, journal, today, compact }) {
    const { t, tx } = useI18n();
    return (
        <div className={`mb-2 flex gap-2 ${compact ? 'min-w-[760px]' : ''}`}>
            <span className="w-11 shrink-0 self-center text-right font-mono text-[10px] text-faint">{t('schedule.anytime')}</span>
            {dates.map((date) => (
                <div key={date} className="flex min-w-0 flex-1 flex-col gap-1">
                    {tasksForDate(date).filter((task) => task.flexible).map((task) => {
                        const record = journal.days[date]?.tasks[task.id];
                        const status = date <= today ? record?.status : null;
                        const total = sessionsMinutes(record?.sessions);
                        let tone = task.mandatory ? 'border-brand-500/40 bg-brand-500/10 text-white' : 'border-dashed border-brand-500/30 bg-ink-900/70 text-muted';
                        if (status === 'done') {
                            tone = 'border-brand-400/60 bg-brand-500/25 text-white';
                        } else if (status === 'skipped') {
                            tone = 'border-danger/30 bg-danger/10 text-muted line-through';
                        }
                        return (
                            <div key={task.id} title={`${tx(task.title)} · ${formatDuration(total)} / ${formatDuration(task.minutes)}`} className={`truncate rounded-md border px-1.5 py-1 text-center font-mono text-[10px] ${tone}`}>
                                <CategoryIcon category={task.category} size={10} className="mr-1 inline" />
                                {compact ? `${formatDuration(total)}/${formatDuration(task.minutes)}` : `${tx(task.title)} · ${formatDuration(total)} / ${formatDuration(task.minutes)}`}
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}

function HourGutter({ ppm, offset }) {
    return (
        <div className="relative w-11 shrink-0" style={{ height: (DAY_END - DAY_START) * ppm, marginTop: offset }}>
            {hourMarks().map((minute) => (
                <span key={minute} className="absolute right-1 -translate-y-1/2 font-mono text-[10px] text-faint" style={{ top: (minute - DAY_START) * ppm }}>
                    {formatClock(minute)}
                </span>
            ))}
        </div>
    );
}

function Legend() {
    const { t } = useI18n();
    const items = [
        ['border-brand-500/40 bg-brand-500/10', t('common.mandatory')],
        ['border-dashed border-brand-500/30 bg-ink-900/70', t('common.optional')],
        ['border-brand-400/60 bg-brand-500/25', t('common.done')],
        ['border-danger/30 bg-danger/10', t('common.skipped')],
        ['border-white/15 bg-white/[0.06]', t('schedule.work')],
        ['border-amber-400/30 bg-amber-400/10', t('schedule.mealsLabel')],
    ];
    return (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-faint">
            {items.map(([tone, label]) => (
                <span key={label} className="flex items-center gap-1.5">
                    <span className={`h-3 w-3 rounded border ${tone}`} />
                    {label}
                </span>
            ))}
        </div>
    );
}

export default function SchedulePage() {
    const { t } = useI18n();
    const journal = useJournal();
    const now = useNow();
    const today = toKey(now);
    const [view, setView] = useState('week');
    const [selected, setSelected] = useState(today);

    const monday = mondayOf(selected);
    const weekDates = WEEK_OFFSETS.map((offset) => addDays(monday, offset));
    const step = view === 'week' ? 7 : 1;
    const ppm = PX_PER_MINUTE[view];

    const open = (date) => {
        setSelected(date);
        setView('day');
    };

    const dayBlocks = blocksForDate(selected);
    const flexibleMinutes = tasksForDate(selected).filter((task) => task.flexible && task.mandatory).reduce((sum, task) => sum + task.minutes, 0);
    const taskMinutes = flexibleMinutes + dayBlocks.filter((block) => block.kind === 'task' && block.task.mandatory).reduce((sum, block) => sum + block.minutes, 0);
    const workMinutes = dayBlocks.filter((block) => block.kind === 'work').reduce((sum, block) => sum + block.minutes, 0);
    const label = view === 'week'
        ? `${fromKey(monday).getDate()} ${t('monthsShort')[fromKey(monday).getMonth()]} – ${fromKey(addDays(monday, 6)).getDate()} ${t('monthsShort')[fromKey(addDays(monday, 6)).getMonth()]}`
        : `${t('weekdays.long')[weekdayOf(selected)]}, ${fromKey(selected).getDate()} ${t('monthsShort')[fromKey(selected).getMonth()]}`;

    return (
        <div>
            <PageHeader
                eyebrow={t('schedule.rhythm', { wake: WAKE_TIME, bed: BEDTIME })}
                title={t('schedule.title')}
                subtitle={t('schedule.subtitle')}
                action={(
                    <div className="flex w-max gap-1 rounded-xl border border-line bg-ink-900 p-1">
                        {['week', 'day'].map((key) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setView(key)}
                                className={`relative rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors ${view === key ? 'text-ink-950' : 'text-muted hover:text-white'}`}
                            >
                                {view === key && <motion.span layoutId="schedule-view" className="absolute inset-0 rounded-lg bg-brand-500" />}
                                <span className="relative">{t(`schedule.${key}`)}</span>
                            </button>
                        ))}
                    </div>
                )}
            />

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-lg font-semibold">{label}</p>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setSelected(today)} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:text-white">
                        {t('schedule.today')}
                    </button>
                    <button type="button" aria-label="Previous" onClick={() => setSelected(addDays(selected, -step))} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white">
                        <LuChevronLeft />
                    </button>
                    <button type="button" aria-label="Next" onClick={() => setSelected(addDays(selected, step))} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white">
                        <LuChevronRight />
                    </button>
                </div>
            </div>

            {view === 'day' && (
                <div className="mb-4 flex flex-wrap gap-2 text-sm">
                    <span className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-brand-300">{t('schedule.plannedHours', { h: (taskMinutes / 60).toFixed(1) })}</span>
                    <span className="rounded-lg bg-white/5 px-3 py-1.5 text-muted">{workMinutes ? t('schedule.workHours', { h: (workMinutes / 60).toFixed(1) }) : t('schedule.noWork')}</span>
                </div>
            )}

            <div className="mb-2 flex items-center gap-2 text-xs text-muted">
                <LuSunrise className="text-brand-400" size={14} />
                {t('schedule.wake')} {WAKE_TIME}
            </div>

            <div className="card overflow-x-auto p-3 sm:p-4">
                <FlexibleRow dates={view === 'week' ? weekDates : [selected]} journal={journal} today={today} compact={view === 'week'} />
                <div className={`flex gap-2 ${view === 'week' ? 'min-w-[760px]' : ''}`}>
                    <HourGutter ppm={ppm} offset={view === 'week' ? HEADER_HEIGHT + HEADER_GAP : 0} />
                    {view === 'week' ? (
                        weekDates.map((date) => (
                            <DayColumn key={date} date={date} weekday={weekdayOf(date)} ppm={ppm} compact journal={journal} today={today} now={now} onOpen={open} />
                        ))
                    ) : (
                        <DayColumn date={selected} weekday={weekdayOf(selected)} ppm={ppm} compact={false} journal={journal} today={today} now={now} onOpen={open} />
                    )}
                </div>
            </div>

            <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <LuMoon className="text-brand-400" size={14} />
                {t('schedule.bedtime')} {BEDTIME}
            </div>

            <Legend />
            <p className="mt-3 text-xs text-faint">{t('schedule.weekHint')}</p>
        </div>
    );
}
