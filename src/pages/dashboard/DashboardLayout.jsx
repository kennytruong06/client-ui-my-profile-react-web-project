import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LuBookOpen, LuCalendarDays, LuChartLine, LuImages, LuLock, LuSettings, LuSunrise } from 'react-icons/lu';
import { useI18n } from '@/i18n/I18nProvider';
import { forgetUnlock } from '@/lib/auth';

const LINKS = [
    { to: '/dashboard', key: 'today', icon: LuSunrise, end: true },
    { to: '/dashboard/calendar', key: 'calendar', icon: LuCalendarDays },
    { to: '/dashboard/english', key: 'english', icon: LuBookOpen },
    { to: '/dashboard/progress', key: 'progress', icon: LuChartLine },
    { to: '/dashboard/daily', key: 'daily', icon: LuImages },
    { to: '/dashboard/settings', key: 'settings', icon: LuSettings },
];

export default function DashboardLayout() {
    const { t } = useI18n();
    const location = useLocation();
    const navigate = useNavigate();

    const lock = () => {
        forgetUnlock();
        navigate('/');
    };

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row lg:gap-10">
            <aside className="lg:sticky lg:top-20 lg:h-fit lg:w-52 lg:shrink-0">
                <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_85%,transparent)] lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:[mask-image:none]">
                    {LINKS.map(({ to, key, icon: Icon, end }) => (
                        <NavLink
                            key={key}
                            to={to}
                            end={end}
                            className={({ isActive }) => `relative flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-muted hover:text-white'}`}
                        >
                            {({ isActive }) => (
                                <>
                                    {isActive && (
                                        <motion.span
                                            layoutId="dashboard-nav"
                                            className="absolute inset-0 rounded-xl border border-brand-500/30 bg-brand-500/10"
                                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                                        />
                                    )}
                                    <Icon size={18} className={`relative ${isActive ? 'text-brand-400' : ''}`} />
                                    <span className="relative">{t(`nav.${key}`)}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                    <button
                        type="button"
                        onClick={lock}
                        className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-faint transition-colors hover:text-danger lg:mt-4 lg:border-t lg:border-line lg:pt-4"
                    >
                        <LuLock size={18} />
                        {t('nav.lock')}
                    </button>
                </nav>
            </aside>

            <div className="min-w-0 flex-1">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -12 }}
                        transition={{ duration: 0.25 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
