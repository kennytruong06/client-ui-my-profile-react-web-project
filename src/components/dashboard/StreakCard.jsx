import { motion } from 'framer-motion';
import { LuFlame, LuTrophy } from 'react-icons/lu';
import AnimatedNumber from '@/components/AnimatedNumber';
import { useI18n } from '@/i18n/I18nProvider';
import { dayStatus, nextMilestone, streakDays, streaks } from '@/lib/stats';
import { fromKey } from '@/lib/date';

const DAYS_SHOWN = 14;

function Flame({ state, index }) {
    const lit = state === 'kept';
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.03 }}
            className={`grid h-8 w-8 place-items-center rounded-full border sm:h-9 sm:w-9 ${lit ? 'border-orange-400/40 bg-orange-500/15 text-orange-400' : state === 'pending' ? 'border-dashed border-brand-400/60 text-brand-300' : state === 'broken' ? 'border-danger/20 bg-danger/5 text-danger/50' : 'border-line text-faint/40'}`}
        >
            <LuFlame size={16} className={lit ? 'drop-shadow-[0_0_6px_rgba(251,146,60,0.7)]' : ''} />
        </motion.span>
    );
}

function Message({ status, current, t }) {
    if (status.mandatoryTotal > 0 && status.mandatoryDone === status.mandatoryTotal) {
        return <p className="text-sm text-brand-300">{t('streak.perfect')}</p>;
    }
    if (status.kept) {
        return <p className="text-sm text-brand-300">{t('streak.safe', { done: status.mandatoryDone, total: status.mandatoryTotal })}</p>;
    }
    const key = current > 0 ? 'streak.needMore' : 'streak.needStart';
    return <p className="text-sm text-amber-300">{t(key, { n: status.keepTarget - status.mandatoryDone })}</p>;
}

export default function StreakCard({ journal, today }) {
    const { t } = useI18n();
    const { current, best } = streaks(journal, today);
    const status = dayStatus(journal, today);
    const days = streakDays(journal, today, DAYS_SHOWN);
    const goal = nextMilestone(current);
    const alive = current > 0;

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card relative mb-6 overflow-hidden p-5 sm:p-6">
            <div className={`pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full blur-3xl ${alive ? 'bg-orange-500/20' : 'bg-white/5'}`} />
            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                    <motion.div
                        animate={alive ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] } : {}}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className={`grid h-20 w-20 shrink-0 place-items-center rounded-2xl ${alive ? 'bg-orange-500/15 text-orange-400 shadow-[0_0_40px_-8px_rgba(251,146,60,0.6)]' : 'bg-white/5 text-faint'}`}
                    >
                        <LuFlame size={44} />
                    </motion.div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-faint">{t('streak.current')}</p>
                        <p className="font-display text-5xl font-semibold leading-none">
                            <AnimatedNumber value={current} /> <span className="text-lg font-normal text-faint">{t('streak.daysUnit')}</span>
                        </p>
                        <p className="mt-2 flex items-center gap-1.5 font-mono text-xs text-muted">
                            <LuTrophy className="text-brand-400" size={13} />
                            {t('streak.best')}: {best}
                        </p>
                    </div>
                </div>

                <div className="min-w-0 space-y-3 lg:max-w-[60%]">
                    <div className="grid w-max grid-cols-7 gap-x-2 gap-y-1.5">
                        {days.map((day, index) => (
                            <span key={day.key} className="flex flex-col items-center gap-1" title={`${day.key} · ${day.done}/${day.total}`}>
                                <Flame state={day.state} index={index} />
                                <span className={`font-mono text-[10px] ${day.state === 'pending' ? 'text-brand-300' : 'text-faint'}`}>{fromKey(day.key).getDate()}</span>
                            </span>
                        ))}
                    </div>
                    <Message status={status} current={current} t={t} />
                    <p className="text-xs text-faint">
                        {t('streak.rule')}
                        {goal ? ` ${t('streak.nextMilestone', { n: goal - current, goal })}` : ` ${t('streak.noMilestone')}`}
                    </p>
                </div>
            </div>
        </motion.section>
    );
}
