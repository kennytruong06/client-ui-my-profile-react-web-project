import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuCheck, LuClock, LuMinus, LuPlus, LuRotateCcw, LuTimer, LuX } from 'react-icons/lu';
import CategoryIcon from '@/components/CategoryIcon';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, updateTask } from '@/store/journalStore';
import { isTimed } from '@/data/schedule';
import { endTime, formatDuration } from '@/lib/date';
import { ratioTone } from '@/lib/stats';

const EMPTY_RECORD = { status: null, note: '', steps: [], stepValues: {}, variant: null, minutes: null };
const STEP_MINUTES = 15;
const MAX_MINUTES = 600;

function StatusBadge({ status }) {
    const { t } = useI18n();
    if (status === 'done') {
        return <span className="rounded-full bg-brand-500/15 px-2.5 py-0.5 text-xs font-semibold text-brand-300">{t('common.done')}</span>;
    }
    if (status === 'skipped') {
        return <span className="rounded-full bg-danger/10 px-2.5 py-0.5 text-xs font-semibold text-danger">{t('common.skipped')}</span>;
    }
    return null;
}

function ActualTime({ date, task, record, locked }) {
    const { t } = useI18n();
    const actual = record.minutes ?? task.minutes;
    const ratio = actual / task.minutes;
    const tone = ratioTone(ratio);
    const setMinutes = (value) => updateTask(date, task.id, { minutes: Math.max(0, Math.min(MAX_MINUTES, Math.round(value))) });

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
        >
            <div className="mt-4 rounded-xl border border-line bg-ink-900/60 p-3 sm:p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
                        <LuTimer size={14} className="text-brand-400" />
                        {t('day.actualTime')}
                    </p>
                    <p className="font-mono text-sm">
                        <span className={tone.text}>{formatDuration(actual)}</span>
                        <span className="text-faint"> / {formatDuration(task.minutes)} · </span>
                        <span className={tone.text}>{Math.round(ratio * 100)}%</span>
                    </p>
                </div>
                {!locked && (
                    <div className="mt-3 flex items-center gap-2">
                        <button type="button" aria-label={`-${STEP_MINUTES}`} onClick={() => setMinutes(actual - STEP_MINUTES)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-white">
                            <LuMinus size={14} />
                        </button>
                        <label className="flex items-center gap-2">
                            <input
                                type="number"
                                min={0}
                                max={MAX_MINUTES}
                                step={5}
                                inputMode="numeric"
                                value={actual}
                                onChange={(event) => setMinutes(Number(event.target.value) || 0)}
                                className="field w-20 py-1.5 text-center font-mono"
                            />
                            <span className="text-sm text-muted">{t('day.minutesUnit')}</span>
                        </label>
                        <button type="button" aria-label={`+${STEP_MINUTES}`} onClick={() => setMinutes(actual + STEP_MINUTES)} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition hover:border-line-strong hover:text-white">
                            <LuPlus size={14} />
                        </button>
                        {record.minutes != null && record.minutes !== task.minutes && (
                            <button type="button" onClick={() => setMinutes(task.minutes)} className="ml-auto text-xs text-faint underline-offset-2 hover:text-white hover:underline">
                                {t('day.resetToTarget')}
                            </button>
                        )}
                    </div>
                )}
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <motion.div className={`h-full rounded-full ${tone.bar}`} animate={{ width: `${Math.min(100, ratio * 100)}%` }} transition={{ duration: 0.4 }} />
                </div>
            </div>
        </motion.div>
    );
}

function StepRow({ step, checked, value, locked, onToggle, onValue }) {
    const { t, tx } = useI18n();
    const measured = step.target != null;
    const ratio = measured && checked ? (value ?? step.target) / step.target : null;
    const tone = ratioTone(ratio ?? 0);

    return (
        <div className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border px-3 py-2 text-sm transition ${checked ? 'border-brand-500/40 bg-brand-500/10' : 'border-line'}`}>
            <button
                type="button"
                disabled={locked}
                onClick={onToggle}
                className={`flex min-w-0 flex-1 items-center gap-2.5 text-left disabled:cursor-default ${checked ? 'text-white' : 'text-muted enabled:hover:text-white'}`}
            >
                <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border transition ${checked ? 'border-brand-500 bg-brand-500 text-ink-950' : 'border-faint'}`}>
                    {checked && <LuCheck size={12} strokeWidth={3} />}
                </span>
                <span className={checked && !measured ? 'line-through decoration-brand-500/60' : ''}>{tx(step.label)}</span>
            </button>
            {measured && (
                <span className="flex items-center gap-2 font-mono text-xs">
                    {checked && !locked ? (
                        <input
                            type="number"
                            min={0}
                            inputMode="numeric"
                            value={value ?? step.target}
                            onChange={(event) => onValue(event.target.value)}
                            aria-label={tx(step.label)}
                            className="field w-16 px-2 py-1 text-center"
                        />
                    ) : (
                        <span className={`w-16 text-right ${checked ? tone.text : 'text-faint'}`}>{checked ? (value ?? step.target) : '—'}</span>
                    )}
                    <span className="w-16 text-faint">/ {step.target} {t(`day.units.${step.unit}`)}</span>
                    {ratio != null && <span className={`w-11 text-right ${tone.text}`}>{Math.round(ratio * 100)}%</span>}
                </span>
            )}
        </div>
    );
}

function StepList({ date, task, record, locked }) {
    const { t } = useI18n();
    const values = record.stepValues ?? {};
    const measured = task.steps.some((step) => step.target != null);

    const save = (steps, stepValues) => {
        const allChecked = task.steps.every((step) => steps.includes(step.id));
        updateTask(date, task.id, { steps, stepValues, status: allChecked ? 'done' : record.status === 'done' ? null : record.status });
    };

    const toggle = (step) => {
        const checked = record.steps.includes(step.id);
        const steps = checked ? record.steps.filter((id) => id !== step.id) : [...record.steps, step.id];
        const stepValues = { ...values };
        if (checked) {
            delete stepValues[step.id];
        } else if (step.target != null) {
            stepValues[step.id] = stepValues[step.id] ?? step.target;
        }
        save(steps, stepValues);
    };

    const setValue = (step, raw) => {
        const value = Math.max(0, Math.min(step.target * 10, Math.round(Number(raw) || 0)));
        save(record.steps, { ...values, [step.id]: value });
    };

    return (
        <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">{t('day.steps')}</p>
            <div className={`grid gap-1.5 ${measured ? '' : 'sm:grid-cols-2'}`}>
                {task.steps.map((step) => (
                    <StepRow
                        key={step.id}
                        step={step}
                        checked={record.steps.includes(step.id)}
                        value={values[step.id]}
                        locked={locked}
                        onToggle={() => toggle(step)}
                        onValue={(raw) => setValue(step, raw)}
                    />
                ))}
            </div>
        </div>
    );
}

function VariantPicker({ date, task, record, locked }) {
    const { t, tx } = useI18n();
    const selected = task.variants.find((variant) => variant.id === record.variant);

    return (
        <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">{t('day.pickVariant')}</p>
            <div className="flex flex-wrap gap-2">
                {task.variants.map((variant) => (
                    <button
                        key={variant.id}
                        type="button"
                        disabled={locked}
                        onClick={() => updateTask(date, task.id, { variant: record.variant === variant.id ? null : variant.id })}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition disabled:cursor-default ${record.variant === variant.id ? 'border-brand-500 bg-brand-500 font-semibold text-ink-950' : 'border-line text-muted enabled:hover:border-line-strong enabled:hover:text-white'}`}
                    >
                        {tx(variant.label)}
                    </button>
                ))}
            </div>
            {selected?.details && <p className="mt-3 rounded-lg bg-ink-850 p-3 text-sm text-muted">{tx(selected.details)}</p>}
        </div>
    );
}

function OutcomeEditor({ date, task, record, locked }) {
    const { t } = useI18n();
    const skipped = record.status === 'skipped';
    const missingReason = skipped && !record.note.trim();

    if (locked && !record.note) {
        return null;
    }

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
        >
            <div className="pt-4">
                <p className="mb-2 block text-xs font-semibold uppercase tracking-wider text-faint">
                    {skipped ? t('day.reasonLabel') : t('day.noteLabel')}
                </p>
                {locked ? (
                    <p className="whitespace-pre-line rounded-xl border border-line bg-ink-900/60 px-3.5 py-2.5 text-sm text-muted">{record.note}</p>
                ) : (
                    <>
                        {skipped && (
                            <div className="mb-2 flex flex-wrap gap-1.5">
                                {t('day.quickReasons').map((reason) => (
                                    <button
                                        key={reason}
                                        type="button"
                                        onClick={() => updateTask(date, task.id, { note: record.note ? `${record.note}; ${reason}` : reason })}
                                        className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-danger/50 hover:text-white"
                                    >
                                        {reason}
                                    </button>
                                ))}
                            </div>
                        )}
                        <textarea
                            rows={2}
                            value={record.note}
                            onChange={(event) => updateTask(date, task.id, { note: event.target.value })}
                            placeholder={skipped ? t('day.reasonPlaceholder') : t('day.notePlaceholder')}
                            className={`field ${missingReason ? 'border-danger/60' : ''}`}
                        />
                        {missingReason && <p className="mt-1.5 text-xs text-danger">{t('day.reasonRequired')}</p>}
                    </>
                )}
            </div>
        </motion.div>
    );
}

export default function TaskCard({ date, task, record = EMPTY_RECORD, disabled = false, roadmapDay = null, index = 0 }) {
    const { t, tx } = useI18n();
    const status = record.status;
    const locked = disabled || !JOURNAL_EDITABLE;
    const timed = isTimed(task);

    const markDone = () => {
        const patch = { status: 'done', minutes: timed ? (record.minutes ?? task.minutes) : null };
        if (task.steps) {
            patch.steps = task.steps.map((step) => step.id);
            patch.stepValues = Object.fromEntries(task.steps.filter((step) => step.target != null).map((step) => [step.id, record.stepValues?.[step.id] ?? step.target]));
        }
        updateTask(date, task.id, patch);
    };
    const markSkipped = () => updateTask(date, task.id, { status: 'skipped', minutes: null });
    const undo = () => updateTask(date, task.id, { status: null, minutes: null });

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className={`card relative overflow-hidden p-4 sm:p-5 transition-colors ${status === 'done' ? 'border-brand-500/40' : status === 'skipped' ? 'border-danger/30' : ''}`}
        >
            <AnimatePresence>
                {status === 'done' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-500/10 via-transparent to-transparent"
                    />
                )}
            </AnimatePresence>

            <div className="relative flex items-start gap-4">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 transition ${status === 'done' ? 'bg-brand-500 text-ink-950 ring-brand-500' : 'bg-ink-800 text-brand-400 ring-line'}`}>
                    <AnimatePresence mode="wait" initial={false}>
                        {status === 'done' ? (
                            <motion.span key="done" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                                <LuCheck size={20} strokeWidth={3} />
                            </motion.span>
                        ) : (
                            <motion.span key="icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                                <CategoryIcon category={task.category} size={20} />
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                        <span className="flex items-center gap-1 font-mono text-muted">
                            <LuClock size={12} />
                            {task.start}–{endTime(task.start, task.minutes)}
                        </span>
                        {timed && <span>{t('day.target')}: {formatDuration(task.minutes)}</span>}
                        <span className="uppercase tracking-wider">{t(`categories.${task.category}`)}</span>
                        <StatusBadge status={status} />
                    </div>
                    <h3 className={`mt-1 font-display text-base font-semibold sm:text-lg ${status === 'skipped' ? 'text-muted line-through decoration-danger/60' : 'text-white'}`}>
                        {tx(task.title)}
                    </h3>
                    {task.details && <p className="mt-1 text-sm text-muted">{tx(task.details)}</p>}
                    {task.roadmap && roadmapDay && (
                        <Link to="/dashboard/english" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300">
                            {t('day.openRoadmap', { n: roadmapDay })}
                            <LuArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </div>

            {task.variants && <VariantPicker date={date} task={task} record={record} locked={locked} />}
            {task.steps && <StepList date={date} task={task} record={record} locked={locked} />}

            <AnimatePresence initial={false}>
                {status === 'done' && timed && <ActualTime key="time" date={date} task={task} record={record} locked={locked} />}
            </AnimatePresence>

            {!locked && (
                <div className="relative mt-4 flex flex-wrap gap-2">
                    {status ? (
                        <button
                            type="button"
                            onClick={undo}
                            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-line-strong hover:text-white"
                        >
                            <LuRotateCcw size={14} />
                            {t('common.undo')}
                        </button>
                    ) : (
                        <>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.94 }}
                                onClick={markDone}
                                className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400"
                            >
                                <LuCheck size={16} strokeWidth={3} />
                                {t('day.markDone')}
                            </motion.button>
                            <motion.button
                                type="button"
                                whileTap={{ scale: 0.94 }}
                                onClick={markSkipped}
                                className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-danger/50 hover:text-white"
                            >
                                <LuX size={16} />
                                {t('day.markSkip')}
                            </motion.button>
                        </>
                    )}
                </div>
            )}

            <AnimatePresence initial={false}>
                {status && <OutcomeEditor key="outcome" date={date} task={task} record={record} locked={locked} />}
            </AnimatePresence>
        </motion.article>
    );
}
