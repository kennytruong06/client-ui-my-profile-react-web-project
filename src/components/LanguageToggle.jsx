import { useId } from 'react';
import { motion } from 'framer-motion';
import { useI18n } from '@/i18n/I18nProvider';

const LANGUAGES = [
    { code: 'en', label: 'EN' },
    { code: 'vi', label: 'VI' },
];

export default function LanguageToggle() {
    const { lang, setLang } = useI18n();
    const pillId = useId();

    return (
        <div role="group" aria-label="Language" className="relative flex rounded-full border border-line bg-ink-900 p-1 text-xs font-semibold">
            {LANGUAGES.map(({ code, label }) => (
                <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                    className={`relative z-10 rounded-full px-3 py-1 transition-colors ${lang === code ? 'text-ink-950' : 'text-muted hover:text-white'}`}
                >
                    {lang === code && (
                        <motion.span
                            layoutId={`lang-pill-${pillId}`}
                            className="absolute inset-0 -z-10 rounded-full bg-brand-500"
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                        />
                    )}
                    {label}
                </button>
            ))}
        </div>
    );
}
