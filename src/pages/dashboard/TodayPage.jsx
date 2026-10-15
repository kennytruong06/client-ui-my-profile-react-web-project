import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LuBookOpen, LuClock, LuFlame, LuTrophy } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import DayPlan from '@/components/dashboard/DayPlan';
import ProgressRing from '@/components/charts/ProgressRing';
import AnimatedNumber from '@/components/AnimatedNumber';
import CategoryIcon from '@/components/CategoryIcon';
import { useI18n } from '@/i18n/I18nProvider';
import { useJournal } from '@/store/journalStore';
import { dayStatus, streaks } from '@/lib/stats';
import { endTime, formatLongDate, minutesOfDay, toKey } from '@/lib/date';
import { roadmapDayFor } from '@/data/ieltsRoadmap';

function useNow() {
    const [now, setNow] = useState(() => new Date());
    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);
    return now;
}

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
    const { current } = streaks(journal, today);
    const roadmapDay = roadmapDayFor(journal.english.startDate, today);
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    const nextTask = status.tasks
        .filter((task) => !status.records[task.id]?.status)
        .sort((a, b) => Number(minutesOfDay(a.start) + a.minutes < nowMinutes) - Number(minutesOfDay(b.start) + b.minutes < nowMinutes) || minutesOfDay(a.start) - minutesOfDay(b.start))[0];

    return (
        <div>
            <PageHeader eyebrow={formatLongDate(today, t)} title={t(greetingKey(now.getHours()))} />

            <div className="mb-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
                                <p className="font-mono text-xs text-muted">{nextTask.start}–{endTime(nextTask.start, nextTask.minutes)}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-brand-300">{t('today.allDone')}</p>
                    )}
                </StatCard>

                <StatCard icon={LuFlame} label={t('today.streak')} delay={0.1}>
                    <p className="font-display text-4xl font-semibold">
                        <AnimatedNumber value={current} />
                    </p>
                </StatCard>

                <StatCard icon={LuBookOpen} label={t('today.roadmapDay')} delay={0.15}>
                    <p className="font-display text-4xl font-semibold">
                        {roadmapDay ? <>{roadmapDay}<span className="text-xl text-faint">/60</span></> : <span className="text-base font-normal text-muted">{t('today.notStarted')}</span>}
                    </p>
                </StatCard>
            </div>

            <DayPlan date={today} />
        </div>
    );
}
