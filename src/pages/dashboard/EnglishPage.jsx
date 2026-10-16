import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuBookOpen, LuCheck, LuChevronLeft, LuChevronRight, LuExternalLink, LuFlag, LuHeadphones, LuLightbulb, LuMic, LuPenLine, LuPlus, LuTriangleAlert, LuX } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import ScoreChart from '@/components/charts/ScoreChart';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, englishLogOf, setEnglishSkillHidden, setEnglishStart, updateEnglishDay, updateEnglishSkill, useJournal } from '@/store/journalStore';
import { ENGLISH_SKILLS, SCORED_SKILLS } from '@/data/english';
import VocabularyTab from '@/components/english/VocabularyTab';
import PracticeTab from '@/components/english/PracticeTab';
import { addDays, todayKey } from '@/lib/date';
import {
    CHECKPOINTS,
    DAILY_BLOCKS,
    DAILY_NOTE,
    LISTENING_METHOD,
    LISTENING_WARNING,
    PRINCIPLES,
    RESOURCES,
    ROADMAP_LENGTH,
    SCORING_NOTE,
    WEEKS,
    roadmapDay,
    roadmapDayFor,
} from '@/data/ieltsRoadmap';

const TABS = ['roadmap', 'vocabulary', 'practice', 'daily', 'method', 'resources', 'tracking'];

const SKILL_ICONS = { listening: LuHeadphones, reading: LuBookOpen, writing: LuPenLine, speaking: LuMic };

function SkillCard({ dayNumber, skill, entry, index }) {
    const { t } = useI18n();
    const Icon = SKILL_ICONS[skill];
    const scored = SCORED_SKILLS.includes(skill);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ delay: index * 0.04 }}
            className="rounded-xl border border-line bg-ink-900/60 p-4"
        >
            <div className="mb-3 flex items-center justify-between gap-2">
                <h4 className="flex items-center gap-2 font-display font-semibold">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/10 text-brand-400"><Icon size={16} /></span>
                    {t(`english.skills.${skill}`)}
                </h4>
                <div className="flex items-center gap-2">
                    {scored && (
                        <label className="flex items-center gap-1.5 text-xs text-faint">
                            <input
                                type="number"
                                min={0}
                                max={40}
                                inputMode="numeric"
                                value={entry?.score ?? ''}
                                readOnly={!JOURNAL_EDITABLE}
                                onChange={(event) => updateEnglishSkill(dayNumber, skill, { score: event.target.value === '' ? '' : String(Math.max(0, Math.min(40, Number(event.target.value)))) })}
                                placeholder="—"
                                className="field w-16 px-2 py-1 text-center font-mono"
                            />
                            /40
                        </label>
                    )}
                    {JOURNAL_EDITABLE && (
                        <button
                            type="button"
                            onClick={() => setEnglishSkillHidden(dayNumber, skill, true)}
                            title={t('english.removeSkill')}
                            aria-label={t('english.removeSkill')}
                            className="grid h-8 w-8 place-items-center rounded-lg border border-line text-faint transition hover:border-danger/50 hover:text-danger"
                        >
                            <LuX size={14} />
                        </button>
                    )}
                </div>
            </div>
            <textarea
                rows={3}
                value={entry?.note ?? ''}
                readOnly={!JOURNAL_EDITABLE}
                onChange={(event) => updateEnglishSkill(dayNumber, skill, { note: event.target.value })}
                placeholder={JOURNAL_EDITABLE ? t(`english.skillPlaceholders.${skill}`) : '—'}
                className="field"
            />
        </motion.div>
    );
}

function DayLog({ dayNumber }) {
    const { t, tx } = useI18n();
    const journal = useJournal();
    const log = englishLogOf(journal, dayNumber);
    const item = roadmapDay(dayNumber);
    const checkpoint = CHECKPOINTS[dayNumber];
    const date = journal.english.startDate ? addDays(journal.english.startDate, dayNumber - 1) : null;
    const visibleSkills = ENGLISH_SKILLS.filter((skill) => !log.hidden.includes(skill));
    const hiddenSkills = ENGLISH_SKILLS.filter((skill) => log.hidden.includes(skill));

    return (
        <motion.div key={dayNumber} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-2xl">
                    <p className="font-mono text-xs uppercase tracking-[0.2em] text-brand-400">
                        {t('english.dayOf', { n: dayNumber })} · {t('english.weekLabel', { n: item.week })}{date && ` · ${date}`}
                    </p>
                    <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-faint">
                        <LuLightbulb size={13} className="text-brand-400" />
                        {t('english.suggestion')}
                    </p>
                    <h2 className="mt-1 font-display text-xl font-semibold sm:text-2xl">{tx(item.text)}</h2>
                    {checkpoint && (
                        <p className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-500/10 px-3 py-1.5 text-sm text-brand-300">
                            <LuFlag size={14} />
                            {t('english.checkpoint')}: {tx(checkpoint)}
                        </p>
                    )}
                </div>
                <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    disabled={!JOURNAL_EDITABLE}
                    onClick={() => updateEnglishDay(dayNumber, { done: !log.done })}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-default ${log.done ? 'bg-brand-500 text-ink-950' : 'border border-line text-muted hover:border-brand-500/50 hover:text-white'}`}
                >
                    <LuCheck size={16} strokeWidth={3} />
                    {log.done ? t('english.dayDone') : t('english.markDayDone')}
                </motion.button>
            </div>

            <div className="mb-3 mt-6 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-faint">{t('english.logTitle')}</h3>
                {JOURNAL_EDITABLE && hiddenSkills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {hiddenSkills.map((skill) => (
                            <button
                                key={skill}
                                type="button"
                                onClick={() => setEnglishSkillHidden(dayNumber, skill, false)}
                                className="flex items-center gap-1 rounded-full border border-dashed border-line-strong px-3 py-1 text-xs text-muted transition hover:border-brand-500 hover:text-white"
                            >
                                <LuPlus size={12} />
                                {t(`english.skills.${skill}`)}
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="grid gap-3 md:grid-cols-2">
                <AnimatePresence initial={false}>
                    {visibleSkills.map((skill, index) => (
                        <SkillCard key={skill} dayNumber={dayNumber} skill={skill} entry={log.skills[skill]} index={index} />
                    ))}
                </AnimatePresence>
            </div>
            {visibleSkills.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">{t('english.allRemoved')}</p>}

            <label className="mt-4 block">
                <span className="mb-1.5 block text-sm text-muted">{t('english.generalNote')}</span>
                <textarea rows={2} value={log.note} readOnly={!JOURNAL_EDITABLE} onChange={(event) => updateEnglishDay(dayNumber, { note: event.target.value })} placeholder={JOURNAL_EDITABLE ? t('english.generalNotePlaceholder') : '—'} className="field" />
            </label>
        </motion.div>
    );
}

function RoadmapTab({ selected, onSelect, logs, currentDay }) {
    const { t, tx } = useI18n();

    return (
        <div className="space-y-4">
            {WEEKS.map((week, weekIndex) => {
                const firstDay = WEEKS.slice(0, weekIndex).reduce((sum, previous) => sum + previous.days.length, 0) + 1;
                const doneCount = week.days.filter((_, index) => logs[firstDay + index]?.done).length;
                return (
                    <motion.section
                        key={week.week}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-40px' }}
                        className="card p-5"
                    >
                        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="font-display font-semibold">
                                <span className="text-brand-400">{t('english.weekLabel', { n: week.week })}</span> · {tx(week.title)}
                            </h3>
                            <span className="font-mono text-xs text-faint">{doneCount}/{week.days.length}</span>
                        </div>
                        <div className="grid gap-1.5">
                            {week.days.map((text, index) => {
                                const dayNumber = firstDay + index;
                                const done = logs[dayNumber]?.done;
                                const isCurrent = dayNumber === currentDay;
                                return (
                                    <button
                                        key={dayNumber}
                                        type="button"
                                        onClick={() => onSelect(dayNumber)}
                                        className={`flex items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition ${selected === dayNumber ? 'bg-brand-500/10 ring-1 ring-brand-500/40' : 'hover:bg-white/5'}`}
                                    >
                                        <span className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[10px] font-bold ${done ? 'border-brand-500 bg-brand-500 text-ink-950' : isCurrent ? 'border-brand-400 text-brand-400' : 'border-faint text-faint'}`}>
                                            {done ? <LuCheck size={12} strokeWidth={3} /> : dayNumber}
                                        </span>
                                        <span className={done ? 'text-muted' : 'text-white'}>
                                            <span className="mr-1 font-semibold">{t('common.day')} {dayNumber}:</span>
                                            {tx(text)}
                                            {CHECKPOINTS[dayNumber] && <LuFlag className="ml-1.5 inline text-brand-400" size={12} />}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </motion.section>
                );
            })}
            <p className="flex items-start gap-2 text-sm text-muted">
                <LuTriangleAlert className="mt-0.5 shrink-0 text-brand-400" />
                {t('english.formatNote')}
            </p>
        </div>
    );
}

function DailyTab() {
    const { t, tx } = useI18n();
    const total = DAILY_BLOCKS.reduce((sum, block) => sum + block.minutes, 0);

    return (
        <div className="space-y-4">
            <div className="flex h-3 overflow-hidden rounded-full bg-ink-800">
                {DAILY_BLOCKS.map((block, index) => (
                    <motion.div
                        key={block.id}
                        initial={{ width: 0 }}
                        animate={{ width: `${(block.minutes / total) * 100}%` }}
                        transition={{ delay: index * 0.08, duration: 0.6 }}
                        className="h-full border-r-2 border-ink-950 last:border-r-0"
                        style={{ background: `color-mix(in oklab, var(--color-brand-500) ${100 - index * 16}%, var(--color-ink-700))` }}
                        title={`${tx(block.title)} · ${block.minutes}′`}
                    />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {DAILY_BLOCKS.map((block, index) => (
                    <motion.div key={block.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card p-5">
                        <div className="mb-3 flex items-baseline justify-between">
                            <h3 className="font-display text-lg font-semibold">{tx(block.title)}</h3>
                            <span className="font-mono text-sm text-brand-400">{t('common.minutes', { n: block.minutes })}</span>
                        </div>
                        <ul className="space-y-1.5 text-sm text-muted">
                            {tx(block.items).map((item) => (
                                <li key={item} className="flex gap-2">
                                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand-500" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>
            <p className="rounded-xl border border-line bg-ink-900/60 p-4 text-sm text-muted">{tx(DAILY_NOTE)}</p>
        </div>
    );
}

function MethodTab() {
    const { tx } = useI18n();

    return (
        <div className="space-y-4">
            <ol className="relative space-y-4 border-l border-line pl-8">
                {LISTENING_METHOD.map((step, index) => (
                    <motion.li key={index} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.07 }} className="relative">
                        <span className="absolute -left-[45px] grid h-8 w-8 place-items-center rounded-full bg-brand-500 font-mono text-sm font-bold text-ink-950">{index + 1}</span>
                        <h3 className="font-display font-semibold">{tx(step.title)}</h3>
                        <p className="text-sm text-muted">{tx(step.text)}</p>
                    </motion.li>
                ))}
            </ol>
            <p className="flex items-start gap-3 rounded-xl border border-brand-500/30 bg-brand-500/10 p-4 text-sm text-brand-300">
                <LuHeadphones className="mt-0.5 shrink-0" />
                {tx(LISTENING_WARNING)}
            </p>
        </div>
    );
}

function ResourcesTab() {
    const { tx } = useI18n();

    return (
        <div className="grid gap-3 md:grid-cols-2">
            {RESOURCES.map((resource, index) => (
                <motion.a
                    key={resource.url}
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    whileHover={{ y: -3 }}
                    className="card group block p-5 transition-colors hover:border-brand-500/40"
                >
                    <div className="flex items-start justify-between gap-3">
                        <h3 className="font-display font-semibold">{resource.name}</h3>
                        <LuExternalLink className="shrink-0 text-faint transition group-hover:text-brand-400" />
                    </div>
                    <p className="mt-2 text-sm text-muted">{tx(resource.note)}</p>
                </motion.a>
            ))}
        </div>
    );
}

function TrackingTab({ logs }) {
    const { t, tx } = useI18n();
    const points = Object.entries(logs).flatMap(([day, log]) => SCORED_SKILLS
        .filter((skill) => log.skills?.[skill]?.score !== undefined && log.skills[skill].score !== '')
        .map((skill) => ({ day: Number(day), series: skill, value: Number(log.skills[skill].score) })));
    const rows = [...new Set(points.map((point) => point.day))].sort((a, b) => a - b);

    return (
        <div className="space-y-6">
            <section className="card p-5">
                <h3 className="mb-4 font-display font-semibold">{t('english.chartTitle')}</h3>
                <ScoreChart points={points} />
                {rows.length > 0 && (
                    <table className="mt-4 w-full text-left text-sm">
                        <thead className="text-xs uppercase tracking-wider text-faint">
                            <tr>
                                <th className="py-2 font-semibold">{t('english.tableDay')}</th>
                                <th className="py-2 font-semibold">Listening</th>
                                <th className="py-2 font-semibold">Reading</th>
                            </tr>
                        </thead>
                        <tbody className="font-mono">
                            {rows.map((day) => (
                                <tr key={day} className="border-t border-line">
                                    <td className="py-2">{day}</td>
                                    <td className="py-2">{logs[day]?.skills?.listening?.score || '—'}</td>
                                    <td className="py-2">{logs[day]?.skills?.reading?.score || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <p className="mt-4 text-sm text-muted">{tx(SCORING_NOTE)}</p>
            </section>

            <section className="card p-5">
                <h3 className="mb-4 font-display font-semibold">{t('english.checkpoint')}</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                    {Object.entries(CHECKPOINTS).map(([day, text]) => (
                        <div key={day} className="flex items-start gap-3 rounded-lg bg-ink-850 p-3 text-sm">
                            <span className="rounded-md bg-brand-500/15 px-2 py-0.5 font-mono text-xs text-brand-300">{t('common.day')} {day}</span>
                            <span className="text-muted">{tx(text)}</span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 className="mb-4 font-display font-semibold">{t('english.principlesTitle')}</h3>
                <div className="grid gap-3 md:grid-cols-3">
                    {PRINCIPLES.map((principle, index) => (
                        <div key={index} className="card p-5">
                            <span className="font-display text-3xl font-semibold text-brand-500">0{index + 1}</span>
                            <h4 className="mt-2 font-semibold">{tx(principle.title)}</h4>
                            <p className="mt-1 text-sm text-muted">{tx(principle.text)}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default function EnglishPage() {
    const { t } = useI18n();
    const journal = useJournal();
    const { startDate, days: logs } = journal.english;
    const today = todayKey();
    const currentDay = roadmapDayFor(startDate, today);
    const finished = Boolean(startDate) && !currentDay && today > startDate;
    const [tab, setTab] = useState('roadmap');
    const [selected, setSelected] = useState(currentDay ?? 1);
    const doneTotal = Object.values(logs).filter((log) => log.done).length;

    const selectDay = (dayNumber) => {
        setSelected(dayNumber);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            <PageHeader
                eyebrow={t('english.completed', { done: doneTotal, total: ROADMAP_LENGTH })}
                title={t('english.title')}
                subtitle={t('english.subtitle')}
                action={(
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-faint">{t('english.startDate')}</span>
                        <input type="date" value={startDate ?? ''} disabled={!JOURNAL_EDITABLE} onChange={(event) => setEnglishStart(event.target.value || null)} className="field w-auto disabled:opacity-60" />
                    </label>
                )}
            />

            <div className="mb-6 h-2 overflow-hidden rounded-full bg-ink-800">
                <motion.div className="h-full rounded-full bg-brand-500" initial={{ width: 0 }} animate={{ width: `${(doneTotal / ROADMAP_LENGTH) * 100}%` }} transition={{ duration: 0.8 }} />
            </div>

            {!startDate && (
                <div className="card mb-6 flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-muted">{t('english.notStarted')}</p>
                    {JOURNAL_EDITABLE && (
                        <button type="button" onClick={() => setEnglishStart(today)} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                            {t('english.setStart')}
                        </button>
                    )}
                </div>
            )}
            {finished && <p className="card mb-6 p-5 text-brand-300">{t('english.finished')}</p>}

            <div className="mb-3 flex items-center justify-end gap-2">
                <button type="button" aria-label="Previous day" disabled={selected <= 1} onClick={() => setSelected(selected - 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white disabled:opacity-30">
                    <LuChevronLeft />
                </button>
                <button type="button" aria-label="Next day" disabled={selected >= ROADMAP_LENGTH} onClick={() => setSelected(selected + 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white disabled:opacity-30">
                    <LuChevronRight />
                </button>
            </div>
            <AnimatePresence mode="wait">
                <DayLog key={selected} dayNumber={selected} />
            </AnimatePresence>

            <p className="mt-4 text-xs text-faint">{t('english.disclaimer')}</p>

            <div className="sticky top-14 z-20 -mx-4 mt-10 mb-6 overflow-x-auto bg-ink-950/80 px-4 py-3 backdrop-blur-xl [mask-image:linear-gradient(to_right,black_88%,transparent)] xl:[mask-image:none]">
                <div className="flex w-max gap-1 rounded-xl border border-line bg-ink-900 p-1">
                    {TABS.map((key) => (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setTab(key)}
                            className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === key ? 'text-ink-950' : 'text-muted hover:text-white'}`}
                        >
                            {tab === key && <motion.span layoutId="english-tab" className="absolute inset-0 rounded-lg bg-brand-500" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                            <span className="relative">{t(`english.tabs.${key}`)}</span>
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                    {tab === 'roadmap' && <RoadmapTab selected={selected} onSelect={selectDay} logs={logs} currentDay={currentDay} />}
                    {tab === 'vocabulary' && <VocabularyTab />}
                    {tab === 'practice' && <PracticeTab />}
                    {tab === 'daily' && <DailyTab />}
                    {tab === 'method' && <MethodTab />}
                    {tab === 'resources' && <ResourcesTab />}
                    {tab === 'tracking' && <TrackingTab logs={logs} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
