import { useState } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { LuArrowRight, LuEye, LuEyeOff, LuLock } from 'react-icons/lu';
import { useI18n } from '@/i18n/I18nProvider';
import { isUnlocked, rememberUnlock, verifyPassword } from '@/lib/auth';

export default function AuthGate({ children }) {
    const { t } = useI18n();
    const [unlocked, setUnlocked] = useState(isUnlocked);
    const [password, setPassword] = useState('');
    const [visible, setVisible] = useState(false);
    const [error, setError] = useState(false);
    const [checking, setChecking] = useState(false);
    const controls = useAnimationControls();

    if (unlocked) {
        return children;
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setChecking(true);
        const ok = await verifyPassword(password);
        setChecking(false);
        if (ok) {
            rememberUnlock();
            setUnlocked(true);
            return;
        }
        setError(true);
        setPassword('');
        controls.start({ x: [0, -12, 12, -8, 8, 0], transition: { duration: 0.4 } });
    };

    return (
        <div className="flex min-h-[70vh] items-center justify-center">
            <motion.form
                onSubmit={handleSubmit}
                animate={controls}
                className="card w-full max-w-sm p-8 text-center"
            >
                <motion.div
                    initial={{ rotate: -20, scale: 0.6 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                    className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-brand-500/15 text-brand-400 ring-1 ring-brand-500/30"
                >
                    <LuLock size={26} />
                </motion.div>
                <h1 className="font-display text-2xl font-semibold">{t('gate.title')}</h1>
                <p className="mt-2 text-sm text-muted">{t('gate.subtitle')}</p>

                <div className="relative mt-6">
                    <input
                        type={visible ? 'text' : 'password'}
                        value={password}
                        onChange={(event) => {
                            setPassword(event.target.value);
                            setError(false);
                        }}
                        placeholder={t('gate.placeholder')}
                        autoFocus
                        autoComplete="current-password"
                        className="field pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setVisible((value) => !value)}
                        aria-label="Toggle password visibility"
                        className="absolute inset-y-0 right-3 text-faint hover:text-white"
                    >
                        {visible ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                    </button>
                </div>

                {error && <p className="mt-3 text-sm text-danger">{t('gate.wrong')}</p>}

                <button
                    type="submit"
                    disabled={!password || checking}
                    className="group mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-40"
                >
                    {t('gate.submit')}
                    <LuArrowRight className="transition-transform group-hover:translate-x-1" />
                </button>
            </motion.form>
        </div>
    );
}
