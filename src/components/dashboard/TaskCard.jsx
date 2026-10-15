import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuCheck, LuClock, LuRotateCcw, LuX } from 'react-icons/lu';
import CategoryIcon from '@/components/CategoryIcon';
import { useI18n } from '@/i18n/I18nProvider';
import { updateTask } from '@/store/journalStore';
import { endTime } from '@/lib/date';

const EMPTY_RECORD = { status: null, note: '', steps: [], variant: null };

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

function StepList({ date, task, record, disabled }) {
    const { t, tx } = useI18n();

    const toggle = (stepId) => {
        const steps = record.steps.includes(stepId) ? record.steps.filter((id) => id !== stepId) : [...record.steps, stepId];
        const allChecked = task.steps.every((step) => steps.includes(step.id));
        updateTask(date, task.id, { steps, status: allChecked ? 'done' : record.status === 'done' ? null : record.status });
    };

    return (
        <div className="mt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">{t('day.steps')}</p>
            <div className="grid gap-1.5 sm:grid-cols-2">
                {task.steps.map((step) => {
                    const checked = record.steps.includes(step.id);
                    return (
                        <button
                            key={step.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => toggle(step.id)}
                            className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm transition ${checked ? 'border-brand-500/40 bg-brand-500/10 text-white' : 'border-line text-muted hover:border-line-strong hover:text-white'}`}
                        >
                            <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border transition ${checked ? 'border-brand-500 bg-brand-500 text-ink-950' : 'border-faint'}`}>
                                {checked && <LuCheck size={12} strokeWidth={3} />}
                            </span>
                            <span className={checked ? 'line-through decoration-brand-500/60' : ''}>{tx(step.label)}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

function VariantPicker({ date, task, record, disabled }) {
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
                        disabled={disabled}
                        onClick={() => updateTask(date, task.id, { variant: record.variant === variant.id ? null : variant.id })}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition ${record.variant === variant.id ? 'border-brand-500 bg-brand-500 font-semibold text-ink-950' : 'border-line text-muted hover:border-line-strong hover:text-white'}`}
                    >
                        {tx(variant.label)}
                    </button>
                ))}
            </div>
            {selected?.details && <p className="mt-3 rounded-lg bg-ink-850 p-3 text-sm text-muted">{tx(selected.details)}</p>}
        </div>
    );
}

function OutcomeEditor({ date, task, record }) {
    const { t } = useI18n();
    const skipped = record.status === 'skipped';
    const missingReason = skipped && !record.note.trim();

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
        >
            <div className="pt-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-faint">
                    {skipped ? t('day.reasonLabel') : t('day.noteLabel')}
                </label>
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
            </div>
        </motion.div>
    );
}

export default function TaskCard({ date, task, record = EMPTY_RECORD, disabled = false, roadmapDay = null, index = 0 }) {
    const { t, tx } = useI18n();
    const status = record.status;

    const setStatus = (next) => updateTask(date, task.id, { status: next });

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
                        <span>{task.minutes >= 60 ? t('common.hours', { n: +(task.minutes / 60).toFixed(1) }) : t('common.minutes', { n: task.minutes })}</span>
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

            {task.variants && <VariantPicker date={date} task={task} record={record} disabled={disabled} />}
            {task.steps && <StepList date={date} task={task} record={record} disabled={disabled} />}

            <div className="relative mt-4 flex flex-wrap gap-2">
                {status ? (
                    <button
                        type="button"
                        onClick={() => setStatus(null)}
                        disabled={disabled}
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
                            onClick={() => setStatus('done')}
                            disabled={disabled}
                            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-1.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-30"
                        >
                            <LuCheck size={16} strokeWidth={3} />
                            {t('day.markDone')}
                        </motion.button>
                        <motion.button
                            type="button"
                            whileTap={{ scale: 0.94 }}
                            onClick={() => setStatus('skipped')}
                            disabled={disabled}
                            className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-danger/50 hover:text-white disabled:opacity-30"
                        >
                            <LuX size={16} />
                            {t('day.markSkip')}
                        </motion.button>
                    </>
                )}
            </div>

            <AnimatePresence initial={false}>
                {status && <OutcomeEditor key="outcome" date={date} task={task} record={record} />}
            </AnimatePresence>
        </motion.article>
    );
}
