import { motion } from 'framer-motion';
import { LuBookOpen, LuFlame, LuSalad, LuSparkles } from 'react-icons/lu';
import AnimatedNumber from '@/components/AnimatedNumber';
import { useI18n } from '@/i18n/I18nProvider';
import { categoryDayState, habitDays, habitStreak } from '@/lib/stats';
import { EATING_FLOOR, currentWeightKg, eatingStateFn, planOf, profileReady } from '@/lib/nutrition';
import { fromKey } from '@/lib/date';

const DAYS_SHOWN = 7;

const TONES = {
    red: {
        text: 'text-red-400',
        blob: 'bg-red-500/20',
        box: 'bg-red-500/15 text-red-400 shadow-[0_0_40px_-8px_rgba(248,113,113,0.6)]',
        dot: 'border-red-400/40 bg-red-500/15 text-red-400',
        glow: 'drop-shadow-[0_0_6px_rgba(248,113,113,0.8)]',
    },
    pink: {
        text: 'text-pink-400',
        blob: 'bg-pink-500/20',
        box: 'bg-pink-500/15 text-pink-400 shadow-[0_0_40px_-8px_rgba(244,114,182,0.6)]',
        dot: 'border-pink-400/40 bg-pink-500/15 text-pink-400',
        glow: 'drop-shadow-[0_0_6px_rgba(244,114,182,0.8)]',
    },
    blue: {
        text: 'text-blue-400',
        blob: 'bg-blue-500/20',
        box: 'bg-blue-500/15 text-blue-400 shadow-[0_0_40px_-8px_rgba(96,165,250,0.6)]',
        dot: 'border-blue-400/40 bg-blue-500/15 text-blue-400',
        glow: 'drop-shadow-[0_0_6px_rgba(96,165,250,0.8)]',
    },
};

function dotClass(state, tone) {
    if (state === 'kept') {
        return tone.dot;
    }
    if (state === 'pending') {
        return 'border-dashed border-white/40 text-white/60';
    }
    if (state === 'broken') {
        return 'border-white/10 bg-white/[0.03] text-faint/60';
    }
    return 'border-line text-faint/30';
}

function HabitCard({ tone, icon: Icon, title, rule, streak, days, message, delay }) {
    const { t } = useI18n();
    const palette = TONES[tone];
    const alive = streak.current > 0;

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card relative overflow-hidden p-5">
            <div className={`pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl ${alive ? palette.blob : 'bg-white/5'}`} />
            <div className="relative">
                <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-faint">
                    <Icon size={14} className={palette.text} />
                    {title}
                </p>

                <div className="mt-4 flex items-center gap-4">
                    <motion.div
                        animate={alive ? { scale: [1, 1.08, 1], rotate: [0, -3, 3, 0] } : {}}
                        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                        className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${alive ? palette.box : 'bg-white/5 text-faint'}`}
                    >
                        <LuFlame size={32} />
                    </motion.div>
                    <div>
                        <p className="font-display text-4xl font-semibold leading-none">
                            <AnimatedNumber value={streak.current} /> <span className="text-base font-normal text-faint">{t('habit.daysUnit')}</span>
                        </p>
                        <p className="mt-1.5 font-mono text-xs text-muted">{t('habit.best')}: {streak.best}</p>
                    </div>
                </div>

                <div className="mt-4 flex gap-1.5">
                    {days.map((day) => (
                        <span key={day.key} className="flex flex-col items-center gap-1" title={day.key}>
                            <span className={`grid h-8 w-8 place-items-center rounded-full border ${dotClass(day.state, palette)}`}>
                                <LuFlame size={15} className={day.state === 'kept' ? palette.glow : ''} />
                            </span>
                            <span className={`font-mono text-[10px] ${day.state === 'pending' ? 'text-white' : 'text-faint'}`}>{fromKey(day.key).getDate()}</span>
                        </span>
                    ))}
                </div>

                <p className={`mt-4 text-sm ${message.good ? palette.text : 'text-amber-300'}`}>{message.text}</p>
                <p className="mt-1 text-xs text-faint">{rule}</p>
            </div>
        </motion.section>
    );
}

export default function HabitStreaks({ journal, today }) {
    const { t } = useI18n();

    const englishOf = (key) => categoryDayState(journal, key, 'english');
    const skincareOf = (key) => categoryDayState(journal, key, 'skincare');
    const plan = profileReady(journal.nutrition.profile) ? planOf(journal.nutrition.profile, currentWeightKg(journal.nutrition)) : null;
    const eatingOf = eatingStateFn(journal.nutrition, plan);

    const english = englishOf(today);
    const skincare = skincareOf(today);
    const eating = eatingOf(today);

    let englishMessage = { good: true, text: t('habit.english.kept') };
    if (english.state === 'rest') {
        englishMessage = { good: true, text: t('habit.english.rest') };
    } else if (english.state === 'broken') {
        englishMessage = { good: false, text: t('habit.english.need', { n: english.need - english.done }) };
    }

    const skincareMessage = skincare.state === 'kept' ? { good: true, text: t('habit.skincare.kept') } : { good: false, text: t('habit.skincare.need') };

    let eatingMessage = { good: true, text: t('habit.eating.ok', { eaten: Math.round(eating.eaten), target: plan?.target }) };
    if (!plan) {
        eatingMessage = { good: false, text: t('habit.eating.noProfile') };
    } else if (!eating.logged) {
        eatingMessage = { good: false, text: t('habit.eating.noLog') };
    } else if (eating.eaten > plan.target) {
        eatingMessage = { good: false, text: t('habit.eating.over', { target: plan.target }) };
    } else if (eating.eaten < plan.bmr * EATING_FLOOR) {
        eatingMessage = { good: false, text: t('habit.eating.low', { floor: Math.round(plan.bmr * EATING_FLOOR) }) };
    }

    return (
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
            <HabitCard tone="red" icon={LuBookOpen} title={t('habit.english.title')} rule={t('habit.english.rule')} streak={habitStreak(englishOf, journal, today)} days={habitDays(englishOf, today, DAYS_SHOWN)} message={englishMessage} delay={0.05} />
            <HabitCard tone="pink" icon={LuSparkles} title={t('habit.skincare.title')} rule={t('habit.skincare.rule')} streak={habitStreak(skincareOf, journal, today)} days={habitDays(skincareOf, today, DAYS_SHOWN)} message={skincareMessage} delay={0.1} />
            <HabitCard tone="blue" icon={LuSalad} title={t('habit.eating.title')} rule={t('habit.eating.rule')} streak={habitStreak(eatingOf, journal, today)} days={habitDays(eatingOf, today, DAYS_SHOWN)} message={eatingMessage} delay={0.15} />
        </div>
    );
}
