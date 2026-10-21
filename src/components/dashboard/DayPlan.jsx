import { LuInfo, LuNotebookPen } from 'react-icons/lu';
import TaskCard from '@/components/dashboard/TaskCard';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, setDayNote, useJournal } from '@/store/journalStore';
import { tasksForWeekday } from '@/data/schedule';
import { roadmapDayFor } from '@/data/ieltsRoadmap';
import { todayKey, weekdayOf } from '@/lib/date';

function Section({ title, count, children }) {
    return (
        <section className="space-y-3">
            <div className="flex items-baseline justify-between">
                <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-muted">{title}</h2>
                <span className="font-mono text-xs text-faint">{count}</span>
            </div>
            {children}
        </section>
    );
}

export default function DayPlan({ date }) {
    const { t } = useI18n();
    const journal = useJournal();
    const weekday = weekdayOf(date);
    const tasks = tasksForWeekday(weekday);
    const day = journal.days[date] ?? { tasks: {}, note: '' };
    const isFuture = date > todayKey();
    const roadmapDay = roadmapDayFor(journal.english.startDate, date);

    const recordOf = (taskId) => ({ status: null, note: '', steps: [], stepValues: {}, variant: null, minutes: null, activity: '', ...day.tasks[taskId] });
    const countDone = (list) => `${list.filter((task) => day.tasks[task.id]?.status === 'done').length}/${list.length}`;

    const mandatory = tasks.filter((task) => task.mandatory);
    const optional = tasks.filter((task) => !task.mandatory);

    return (
        <div className="space-y-8">
            {(isFuture || weekday === 0) && (
                <div className="flex items-start gap-3 rounded-xl border border-line bg-ink-900/60 p-4 text-sm text-muted">
                    <LuInfo className="mt-0.5 shrink-0 text-brand-400" />
                    <div className="space-y-1">
                        {weekday === 0 && <p>{t('day.sundayInfo')}</p>}
                        {isFuture && <p>{t('day.futureDay')}</p>}
                    </div>
                </div>
            )}

            <Section title={t('day.mandatoryTitle')} count={countDone(mandatory)}>
                {mandatory.map((task, index) => (
                    <TaskCard key={task.id} date={date} task={task} record={recordOf(task.id)} disabled={isFuture} roadmapDay={roadmapDay} index={index} />
                ))}
            </Section>

            {optional.length > 0 && (
                <Section title={t('day.optionalTitle')} count={countDone(optional)}>
                    {optional.map((task, index) => (
                        <TaskCard key={task.id} date={date} task={task} record={recordOf(task.id)} disabled={isFuture} roadmapDay={roadmapDay} index={index} />
                    ))}
                </Section>
            )}

            <section className="card p-5">
                <h2 className="mb-3 flex items-center gap-2 font-display font-semibold">
                    <LuNotebookPen className="text-brand-400" />
                    {t('day.dayNoteTitle')}
                </h2>
                {JOURNAL_EDITABLE ? (
                    <textarea
                        rows={4}
                        value={day.note}
                        onChange={(event) => setDayNote(date, event.target.value)}
                        placeholder={t('day.dayNotePlaceholder')}
                        className="field"
                    />
                ) : (
                    <p className="whitespace-pre-line text-sm text-muted">{day.note || '—'}</p>
                )}
            </section>
        </div>
    );
}
