import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuCheck, LuClock, LuPlus, LuRotateCcw, LuTrash2, LuX } from 'react-icons/lu';
import CategoryIcon from '@/components/CategoryIcon';
import { OutcomeEditor, StatusBadge } from '@/components/dashboard/TaskCard';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, addSession, removeSession, sessionsMinutes, updateSession, updateTask } from '@/store/journalStore';
import { estimateMinutes } from '@/data/exercise';
import { SESSION_KINDS, metricsOf, topicOf } from '@/data/sessionKinds';
import { formatDuration } from '@/lib/date';

const EMPTY_RECORD = { status: null, note: '', steps: [], stepValues: {}, variant: null, minutes: null, activity: '', sessions: [] };
const EMPTY_DRAFT = { topic: '', minutes: '', reps: '', km: '', note: '' };

function NumberField({ value, unit, label, onChange, step = 1, width = 'w-24' }) {
    return (
        <div className={`relative shrink-0 ${width}`}>
            <input type="number" inputMode="decimal" min="0" step={step} value={value} aria-label={label} placeholder={label} onChange={(event) => onChange(event.target.value)} className="field !py-1.5 pr-10 text-right font-mono !text-sm" />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-faint">{unit}</span>
        </div>
    );
}

function TopicSelect({ kind, value, onChange, label }) {
    const { t, tx } = useI18n();
    const { groups, topics } = SESSION_KINDS[kind];
    return (
        <select value={value} onChange={(event) => onChange(event.target.value)} aria-label={label} className="field !py-1.5 !text-sm">
            {groups.map((group) => (
                <optgroup key={group} label={t(`day.${kind}.groups.${group}`)}>
                    {topics.filter((topic) => topic.group === group).map((topic) => <option key={topic.id} value={topic.id}>{tx(topic.label)}</option>)}
                </optgroup>
            ))}
        </select>
    );
}

function detailOf(session, metrics, t, kind) {
    const parts = [];
    if (metrics.includes('reps') && session.reps) {
        parts.push(`${session.reps} ${t(`day.${kind}.repsShort`)}`);
    }
    if (metrics.includes('km') && session.km) {
        parts.push(`${session.km} ${t(`day.${kind}.kmShort`)}`);
    }
    parts.push(formatDuration(session.minutes));
    return parts.join(' · ');
}

function SessionRow({ kind, date, task, session, locked }) {
    const { t, tx } = useI18n();
    const topic = topicOf(kind, session.topic);
    const metrics = metricsOf(kind, session.topic);
    const change = (patch) => updateSession(date, task, session.id, patch);

    return (
        <li className="rounded-xl border border-line bg-ink-900/50 px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
                {locked ? (
                    <>
                        <p className="min-w-0 flex-1 text-sm font-medium">{topic ? tx(topic.label) : session.topic}</p>
                        <span className="font-mono text-sm text-brand-300">{detailOf(session, metrics, t, kind)}</span>
                    </>
                ) : (
                    <>
                        <div className="min-w-0 flex-1 basis-44">
                            <TopicSelect kind={kind} value={session.topic} label={t(`day.${kind}.pickTopic`)} onChange={(next) => change({ topic: next })} />
                        </div>
                        {metrics.includes('reps') && <NumberField value={session.reps || ''} unit={t(`day.${kind}.repsShort`)} label={t(`day.${kind}.reps`)} onChange={(next) => change({ reps: Math.max(Number(next) || 0, 0) })} />}
                        {metrics.includes('km') && <NumberField value={session.km || ''} unit={t(`day.${kind}.kmShort`)} label={t(`day.${kind}.km`)} step={0.1} onChange={(next) => change({ km: Math.max(Number(next) || 0, 0) })} />}
                        <NumberField value={session.minutes} unit={t(`day.${kind}.minShort`)} label={t(`day.${kind}.minutes`)} step={5} onChange={(next) => change({ minutes: Math.max(Number(next) || 0, 0) })} />
                        <button type="button" aria-label={t(`day.${kind}.remove`)} onClick={() => removeSession(date, task, session.id)} className="grid h-7 w-7 place-items-center rounded-lg text-faint transition hover:text-danger">
                            <LuTrash2 size={15} />
                        </button>
                    </>
                )}
            </div>
            {locked ? (
                session.note && <p className="mt-1.5 text-sm text-muted">{session.note}</p>
            ) : (
                <input value={session.note} onChange={(event) => change({ note: event.target.value })} placeholder={t(`day.${kind}.notePlaceholder`)} className="field mt-2 !py-1.5 !text-sm" />
            )}
        </li>
    );
}

function AddSession({ kind, date, task, left }) {
    const { t, tx } = useI18n();
    const { groups, topics, quickMinutes } = SESSION_KINDS[kind];
    const [draft, setDraft] = useState(EMPTY_DRAFT);
    const [minutesTouched, setMinutesTouched] = useState(false);

    const metrics = metricsOf(kind, draft.topic);
    const needsReps = metrics.includes('reps');
    const set = (patch) => setDraft((current) => ({ ...current, ...patch }));
    const setReps = (value) => {
        const patch = { reps: value };
        if (!minutesTouched && Number(value) > 0) {
            patch.minutes = String(estimateMinutes(value));
        }
        set(patch);
    };
    const setMinutes = (value) => {
        setMinutesTouched(true);
        set({ minutes: value });
    };

    const valid = draft.topic && Number(draft.minutes) > 0 && (!needsReps || Number(draft.reps) > 0) && (draft.topic !== 'other' || draft.note.trim());
    const add = () => {
        if (!valid) {
            return;
        }
        addSession(date, task, {
            topic: draft.topic,
            minutes: Number(draft.minutes),
            reps: needsReps ? Number(draft.reps) : 0,
            km: metrics.includes('km') ? Number(draft.km) || 0 : 0,
            note: draft.note.trim(),
        });
        setDraft(EMPTY_DRAFT);
        setMinutesTouched(false);
    };

    return (
        <div className="mt-4 space-y-3 rounded-2xl border border-line bg-ink-900/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">{t(`day.${kind}.addTitle`)}</p>
            <div className="space-y-2">
                {groups.map((group) => (
                    <div key={group} className="flex flex-wrap items-center gap-1.5">
                        <span className="w-20 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-faint">{t(`day.${kind}.groups.${group}`)}</span>
                        {topics.filter((item) => item.group === group).map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                aria-pressed={draft.topic === item.id}
                                onClick={() => set({ topic: draft.topic === item.id ? '' : item.id })}
                                className={`rounded-full border px-3 py-1 text-sm transition ${draft.topic === item.id ? 'border-brand-500 bg-brand-500/15 text-brand-300' : 'border-line text-muted hover:border-brand-500/50 hover:text-white'}`}
                            >
                                {tx(item.label)}
                            </button>
                        ))}
                    </div>
                ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {needsReps && <NumberField value={draft.reps} unit={t(`day.${kind}.repsShort`)} label={t(`day.${kind}.reps`)} width="w-32" onChange={setReps} />}
                {metrics.includes('km') && <NumberField value={draft.km} unit={t(`day.${kind}.kmShort`)} label={t(`day.${kind}.km`)} width="w-32" step={0.1} onChange={(value) => set({ km: value })} />}
                <NumberField value={draft.minutes} unit={t(`day.${kind}.minShort`)} label={t(`day.${kind}.minutes`)} width="w-32" step={5} onChange={setMinutes} />
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
                {quickMinutes.map((value) => (
                    <button key={value} type="button" onClick={() => setMinutes(String(value))} className={`rounded-full border px-2.5 py-1 font-mono text-xs transition ${Number(draft.minutes) === value ? 'border-brand-500 bg-brand-500/15 text-brand-300' : 'border-line text-muted hover:text-white'}`}>
                        {value}′
                    </button>
                ))}
                {left > 0 && (
                    <button type="button" onClick={() => setMinutes(String(left))} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-brand-500/50 hover:text-white">
                        {t(`day.${kind}.rest`, { n: left })}
                    </button>
                )}
            </div>
            {needsReps && <p className="text-xs text-faint">{t(`day.${kind}.estimate`)}</p>}
            <input value={draft.note} onChange={(event) => set({ note: event.target.value })} placeholder={t(`day.${kind}.notePlaceholder`)} className="field !text-sm" />
            {draft.topic === 'other' && !draft.note.trim() && <p className="text-xs text-faint">{t(`day.${kind}.noteRequired`)}</p>}
            {needsReps && !(Number(draft.reps) > 0) && <p className="text-xs text-faint">{t(`day.${kind}.repsRequired`)}</p>}
            <button type="button" disabled={!valid} onClick={add} className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-40">
                <LuPlus size={15} />
                {t(`day.${kind}.add`)}
            </button>
        </div>
    );
}

export default function SessionCard({ date, task, record = EMPTY_RECORD, disabled = false, roadmapDay = null, roadmapSuggestion = null, index = 0 }) {
    const { t, tx } = useI18n();
    const kind = task.sessions;
    const sessions = record.sessions ?? [];
    const status = record.status;
    const locked = disabled || !JOURNAL_EDITABLE;
    const total = sessionsMinutes(sessions);
    const left = Math.max(task.minutes - total, 0);
    const ratio = Math.min(total / task.minutes, 1);
    const enough = total >= task.minutes;
    const reps = sessions.reduce((sum, session) => sum + (metricsOf(kind, session.topic).includes('reps') ? Number(session.reps) || 0 : 0), 0);
    const km = sessions.reduce((sum, session) => sum + (metricsOf(kind, session.topic).includes('km') ? Number(session.km) || 0 : 0), 0);
    const extras = [reps > 0 && `${reps} ${t(`day.${kind}.repsShort`)}`, km > 0 && `${Math.round(km * 10) / 10} ${t(`day.${kind}.kmShort`)}`].filter(Boolean);

    return (
        <motion.article
            layout
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            className={`card relative overflow-hidden p-4 transition-colors sm:p-5 ${status === 'done' ? 'border-brand-500/40' : status === 'skipped' ? 'border-danger/30' : ''}`}
        >
            <div className="relative flex items-start gap-4">
                <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ring-1 transition ${status === 'done' ? 'bg-brand-500 text-ink-950 ring-brand-500' : 'bg-ink-800 text-brand-400 ring-line'}`}>
                    {status === 'done' ? <LuCheck size={20} strokeWidth={3} /> : <CategoryIcon category={task.category} size={20} />}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-faint">
                        <span className="flex items-center gap-1 font-mono text-muted">
                            <LuClock size={12} />
                            {t(`day.${kind}.flexible`)}
                        </span>
                        <span>{t('day.target')}: {formatDuration(task.minutes)}</span>
                        <span className="uppercase tracking-wider">{t(`categories.${task.category}`)}</span>
                        <StatusBadge status={status} />
                    </div>
                    <h3 className={`mt-1 font-display text-base font-semibold sm:text-lg ${status === 'skipped' ? 'text-muted line-through decoration-danger/60' : 'text-white'}`}>{tx(task.title)}</h3>
                    <p className="mt-1 text-sm text-muted">{tx(task.details)}</p>
                    {task.roadmap && (roadmapDay || roadmapSuggestion) && (
                        <Link to="/dashboard/english" className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand-400 hover:text-brand-300">
                            {roadmapDay ? t('day.openRoadmap', { n: roadmapDay }) : t('day.openRoadmapSuggested', { n: roadmapSuggestion })}
                            <LuArrowRight size={14} />
                        </Link>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <div className="mb-1.5 flex items-baseline justify-between gap-3">
                    <p className="font-mono text-sm">
                        <span className={enough ? 'text-brand-300' : 'text-white'}>{formatDuration(total)}</span>
                        <span className="text-faint"> / {formatDuration(task.minutes)}</span>
                        {extras.length > 0 && <span className="ml-3 text-muted">{extras.join(' · ')}</span>}
                    </p>
                    <p className={`font-mono text-xs ${enough ? 'text-brand-300' : 'text-muted'}`}>{enough ? t(`day.${kind}.enough`) : t(`day.${kind}.left`, { n: left })}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                    <motion.div className={`h-full rounded-full ${enough ? 'bg-brand-500' : 'bg-amber-400'}`} initial={false} animate={{ width: `${ratio * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
            </div>

            <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">{t(`day.${kind}.sessions`)}</p>
                {sessions.length > 0 ? (
                    <ul className="space-y-1.5">
                        {sessions.map((session) => <SessionRow key={session.id} kind={kind} date={date} task={task} session={session} locked={locked} />)}
                    </ul>
                ) : (
                    <p className="rounded-xl border border-dashed border-line px-3 py-2.5 text-sm text-faint">{t(`day.${kind}.noSessions`)}</p>
                )}
            </div>

            {!locked && status !== 'skipped' && <AddSession kind={kind} date={date} task={task} left={left} />}

            {!locked && (status === 'skipped' || (!status && sessions.length === 0)) && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {status === 'skipped' ? (
                        <button type="button" onClick={() => updateTask(date, task.id, { status: null, minutes: null })} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-line-strong hover:text-white">
                            <LuRotateCcw size={14} />
                            {t('common.undo')}
                        </button>
                    ) : (
                        <button type="button" onClick={() => updateTask(date, task.id, { status: 'skipped', minutes: null })} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:border-danger/50 hover:text-white">
                            <LuX size={16} />
                            {t('day.markSkip')}
                        </button>
                    )}
                </div>
            )}

            <AnimatePresence initial={false}>
                {status === 'skipped' && <OutcomeEditor key="outcome" date={date} task={task} record={{ ...EMPTY_RECORD, ...record }} locked={locked} />}
            </AnimatePresence>
        </motion.article>
    );
}
