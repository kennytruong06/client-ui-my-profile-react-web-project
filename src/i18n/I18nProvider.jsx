import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import en from '@/i18n/locales/en';
import vi from '@/i18n/locales/vi';

const DICTIONARIES = { en, vi };
const STORAGE_KEY = 'kp.lang';
const DEFAULT_LANG = 'en';

const I18nContext = createContext(null);

function readStoredLang() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return DICTIONARIES[stored] ? stored : DEFAULT_LANG;
    } catch {
        return DEFAULT_LANG;
    }
}

function resolvePath(dictionary, key) {
    return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dictionary);
}

function interpolate(text, params) {
    if (!params) {
        return text;
    }
    return text.replace(/\{(\w+)\}/g, (match, name) => (params[name] ?? match));
}

export function I18nProvider({ children }) {
    const [lang, setLangState] = useState(readStoredLang);

    useEffect(() => {
        document.documentElement.lang = lang;
    }, [lang]);

    const setLang = useCallback((next) => {
        setLangState(next);
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {
            return;
        }
    }, []);

    const t = useCallback((key, params) => {
        const value = resolvePath(DICTIONARIES[lang], key) ?? resolvePath(DICTIONARIES[DEFAULT_LANG], key) ?? key;
        return typeof value === 'string' ? interpolate(value, params) : value;
    }, [lang]);

    const tx = useCallback((localized) => {
        if (localized == null || typeof localized === 'string') {
            return localized;
        }
        return localized[lang] ?? localized[DEFAULT_LANG];
    }, [lang]);

    const value = useMemo(() => ({ lang, setLang, t, tx }), [lang, setLang, t, tx]);

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
    return useContext(I18nContext);
}
