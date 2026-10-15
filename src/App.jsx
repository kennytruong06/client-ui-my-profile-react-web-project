import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Backdrop from '@/components/Backdrop';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import AuthGate from '@/components/AuthGate';
import HomePage from '@/pages/home/HomePage';
import MyMemoriesPage from '@/pages/memories/MyMemoriesPage';
import DashboardLayout from '@/pages/dashboard/DashboardLayout';
import TodayPage from '@/pages/dashboard/TodayPage';
import CalendarPage from '@/pages/dashboard/CalendarPage';
import EnglishPage from '@/pages/dashboard/EnglishPage';
import ProgressPage from '@/pages/dashboard/ProgressPage';
import SettingsPage from '@/pages/dashboard/SettingsPage';
import DailyPage from '@/pages/dashboard/DailyPage';

function AnimatedRoutes() {
    const location = useLocation();
    const section = location.pathname.split('/')[1] || 'home';

    return (
        <AnimatePresence mode="wait">
            <motion.main
                key={section}
                initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 min-h-screen px-4 pt-20 pb-32 sm:px-6"
            >
                <Routes location={location}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/memories" element={<MyMemoriesPage />} />
                    <Route path="/dashboard" element={<AuthGate><DashboardLayout /></AuthGate>}>
                        <Route index element={<TodayPage />} />
                        <Route path="calendar" element={<CalendarPage />} />
                        <Route path="english" element={<EnglishPage />} />
                        <Route path="progress" element={<ProgressPage />} />
                        <Route path="daily" element={<DailyPage />} />
                        <Route path="settings" element={<SettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </motion.main>
        </AnimatePresence>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Backdrop />
            <TopBar />
            <AnimatedRoutes />
            <BottomNav />
        </BrowserRouter>
    );
}
