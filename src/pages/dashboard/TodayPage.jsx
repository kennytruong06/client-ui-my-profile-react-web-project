import { motion } from 'framer-motion';
import { LuBookOpen, LuClock, LuTrophy } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import DayPlan from '@/components/dashboard/DayPlan';
import ProgressRing from '@/components/charts/ProgressRing';
import StreakCard from '@/components/dashboard/StreakCard';
import HabitStreaks from '@/components/dashboard/HabitStreaks';
import CategoryIcon from '@/components/CategoryIcon';
import useNow from '@/hooks/useNow';
import { useI18n } from '@/i18n/I18nProvider';
import { sessionsMinutes, useJournal } from '@/store/journalStore';
import { dayStatus, roadmapDayFor, suggestedRoadmapDay } from '@/lib/stats';
import { endTime, formatLongDate, minutesOfDay, toKey } from '@/lib/date';

function greetingKey(hour) {
    if (hour < 12) {
        return 'today.greetingMorning';
    }
    return hour < 18 ? 'today.greetingAfternoon' : 'today.greetingEvening';
}

function StatCard({ icon: Icon, label, children, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="card flex flex-col justify-between gap-3 p-5"
        >
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
                <Icon className="text-brand-400" size={14} />
                {label}
            </p>
            {children}
        </motion.div>
    );
}

export default function TodayPage() {
    const { t, tx } = useI18n();
    const journal = useJournal();
    const now = useNow();
    const today = toKey(now);
    const status = dayStatus(journal, today);
    const roadmapDay = roadmapDayFor(journal, today);
    const suggestedDay = suggestedRoadmapDay(journal);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const pending = status.tasks.filter((task) => !status.records[task.id]?.status);
    const nextTask = pending
        .filter((task) => !task.flexible)
        .sort((a, b) => Number(minutesOfDay(a.start) + a.minutes < nowMinutes) - Number(minutesOfDay(b.start) + b.minutes < nowMinutes) || minutesOfDay(a.start) - minutesOfDay(b.start))[0] ?? pending[0];

    return (
        <div>
            <PageHeader eyebrow={formatLongDate(today, t)} title={t(greetingKey(now.getHours()))} />

            <StreakCard journal={journal} today={today} />
            <HabitStreaks journal={journal} today={today} />

            <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard icon={LuTrophy} label={t('today.mandatoryProgress')} delay={0}>
                    <div className="flex items-center gap-4">
                        <ProgressRing value={status.ratio} size={72} stroke={7} label={t('today.mandatoryProgress')}>
                            <span className="font-mono text-sm font-semibold">{Math.round(status.ratio * 100)}%</span>
                        </ProgressRing>
                        <p className="font-display text-3xl font-semibold">
                            {status.mandatoryDone}<span className="text-faint">/{status.mandatoryTotal}</span>
                        </p>
                    </div>
                </StatCard>

                <StatCard icon={LuClock} label={t('today.nextUp')} delay={0.05}>
                    {nextTask ? (
                        <div className="flex items-center gap-3">
                            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-500/15 text-brand-400">
                                <CategoryIcon category={nextTask.category} />
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-semibold">{tx(nextTask.title)}</p>
                                <p className="font-mono text-xs text-muted">
                                    {nextTask.flexible
                                        ? t(`day.${nextTask.sessions}.left`, { n: Math.max(nextTask.minutes - sessionsMinutes(status.records[nextTask.id]?.sessions), 0) })
                                        : `${nextTask.start}–${endTime(nextTask.start, nextTask.minutes)}`}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-brand-300">{t('today.allDone')}</p>
                    )}
                </StatCard>

                <StatCard icon={LuBookOpen} label={t('today.roadmapDay')} delay={0.1}>
                    <p className="font-display text-4xl font-semibold">
                        {roadmapDay ? <>{roadmapDay}<span className="text-xl text-faint">/60</span></> : <span className="text-base font-normal text-muted">{t('today.notAssigned')}</span>}
                    </p>
                    {!roadmapDay && suggestedDay && <p className="mt-1 text-xs text-faint">{t('today.roadmapSuggested', { n: suggestedDay })}</p>}
                </StatCard>
            </div>

            <DayPlan date={today} />
        </div>
    );
}
