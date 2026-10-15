import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuImages, LuLock, LuMusic, LuSparkles, LuTrophy } from 'react-icons/lu';
import BlurText from '@/components/BlurText';
import { useI18n } from '@/i18n/I18nProvider';
import { COMING_SOON, SKILL_GROUPS } from '@/data/skills';
import avatar from '@/assets/logo/2.png';

const GROUP_ICONS = { sports: LuTrophy, music: LuMusic, others: LuSparkles };

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (index = 0) => ({ opacity: 1, y: 0, transition: { delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] } }),
};

export default function HomePage() {
    const { t, tx, lang } = useI18n();

    return (
        <div className="mx-auto max-w-6xl">
            <section className="flex min-h-[72vh] flex-col items-center justify-center text-center">
                <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 18 }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 animate-ping rounded-full bg-brand-500/20 [animation-duration:3s]" />
                    <img src={avatar} alt={t('home.name')} className="relative h-28 w-28 rounded-full border-2 border-brand-500 bg-ink-900 object-cover p-1" />
                    <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-ink-950 bg-brand-500" />
                </motion.div>

                <motion.p variants={fadeUp} initial="hidden" animate="show" className="mb-3 font-mono text-sm uppercase tracking-[0.3em] text-brand-400">
                    {t('home.greeting')}
                </motion.p>
                <BlurText
                    key={lang}
                    text={t('home.name')}
                    delay={120}
                    animateBy="letters"
                    direction="top"
                    className="justify-center font-display text-5xl font-bold tracking-tight sm:text-7xl"
                />
                <motion.p variants={fadeUp} initial="hidden" animate="show" custom={2} className="mt-3 text-faint">
                    {t('home.fullName')} · {t('home.role')}
                </motion.p>
                <motion.h2 variants={fadeUp} initial="hidden" animate="show" custom={3} className="text-gradient mt-6 max-w-2xl font-display text-2xl font-medium sm:text-3xl">
                    {t('home.tagline')}
                </motion.h2>

                <motion.div variants={fadeUp} initial="hidden" animate="show" custom={4} className="mt-10 flex flex-wrap justify-center gap-3">
                    <Link to="/dashboard" className="group flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 font-semibold text-ink-950 shadow-lg shadow-brand-500/25 transition hover:bg-brand-400">
                        <LuLock size={16} />
                        {t('home.ctaDashboard')}
                        <LuArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link to="/memories" className="flex items-center gap-2 rounded-xl border border-line-strong px-6 py-3 font-semibold text-white transition hover:border-brand-500/60 hover:bg-white/5">
                        <LuImages size={16} />
                        {t('home.ctaMemories')}
                    </Link>
                </motion.div>
                <motion.p variants={fadeUp} initial="hidden" animate="show" custom={5} className="mt-4 text-xs text-faint">
                    {t('home.privateNote')}
                </motion.p>
            </section>

            <section className="py-16">
                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mb-10 text-center">
                    <h2 className="font-display text-3xl font-semibold sm:text-4xl">{t('home.skillsTitle')}</h2>
                    <p className="mt-2 text-muted">{t('home.skillsSubtitle')}</p>
                </motion.div>
                <div className="grid gap-4 lg:grid-cols-2">
                    {SKILL_GROUPS.map((group, groupIndex) => {
                        const GroupIcon = GROUP_ICONS[group.id];
                        return (
                            <motion.article
                                key={group.id}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={{ once: true, margin: '-60px' }}
                                custom={groupIndex}
                                className={`card p-6 ${group.id === 'sports' ? 'lg:row-span-2' : ''}`}
                            >
                                <h3 className="mb-5 flex items-center gap-3 font-display text-lg font-semibold">
                                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-500/10 text-brand-400 ring-1 ring-brand-500/20">
                                        <GroupIcon size={18} />
                                    </span>
                                    {tx(group.title)}
                                </h3>
                                <ul className="space-y-3.5">
                                    {group.skills.map((skill, index) => (
                                        <li key={skill.id}>
                                            <div className="mb-1.5 flex items-center justify-between text-sm">
                                                <span className="text-white">{tx(skill.label)}</span>
                                                <span className="font-mono text-muted">{skill.score}/10</span>
                                            </div>
                                            <div className="flex gap-1">
                                                {Array.from({ length: 10 }, (_, step) => (
                                                    <motion.span
                                                        key={step}
                                                        initial={{ scaleY: 0.2, opacity: 0.2 }}
                                                        whileInView={{ scaleY: 1, opacity: 1 }}
                                                        viewport={{ once: true }}
                                                        transition={{ delay: index * 0.05 + step * 0.03 }}
                                                        className={`h-2 flex-1 rounded-full ${step < skill.score ? 'bg-brand-500' : 'bg-ink-700'}`}
                                                    />
                                                ))}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.article>
                        );
                    })}
                </div>

                <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {COMING_SOON.map((item) => (
                        <div key={item.id} className="card relative overflow-hidden p-6">
                            <p className="select-none font-display text-lg font-semibold blur-[6px]" aria-hidden="true">{tx(item.label)}</p>
                            <div className="mt-3 flex select-none gap-1 blur-[3px]" aria-hidden="true">
                                {Array.from({ length: 10 }, (_, step) => <span key={step} className="h-2 flex-1 rounded-full bg-ink-700" />)}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-ink-950/30 text-sm font-semibold text-brand-300">
                                <LuLock size={14} />
                                {t('home.comingSoon')}
                            </div>
                        </div>
                    ))}
                </motion.div>
            </section>
        </div>
    );
}
