import { motion } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { LuHouse, LuImages, LuLayoutDashboard } from 'react-icons/lu';
import { useI18n } from '@/i18n/I18nProvider';

const ITEMS = [
    { to: '/', key: 'home', icon: LuHouse },
    { to: '/memories', key: 'memories', icon: LuImages },
    { to: '/dashboard', key: 'dashboard', icon: LuLayoutDashboard },
];

function isActive(pathname, to) {
    return to === '/' ? pathname === '/' : pathname.startsWith(to);
}

export default function BottomNav() {
    const { t } = useI18n();
    const { pathname } = useLocation();

    return (
        <nav className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
            <motion.div
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 24 }}
                className="flex gap-1 rounded-2xl border border-line-strong bg-ink-900/80 p-1.5 shadow-2xl shadow-black/60 backdrop-blur-xl"
            >
                {ITEMS.map(({ to, key, icon: Icon }) => {
                    const active = isActive(pathname, to);
                    return (
                        <NavLink
                            key={key}
                            to={to}
                            className={`relative flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${active ? 'text-ink-950' : 'text-muted hover:text-white'}`}
                        >
                            {active && (
                                <motion.span
                                    layoutId="bottom-nav-pill"
                                    className="absolute inset-0 rounded-xl bg-brand-500"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <Icon className="relative" size={18} />
                            <span className="relative hidden sm:inline">{t(`nav.${key}`)}</span>
                        </NavLink>
                    );
                })}
            </motion.div>
        </nav>
    );
}
