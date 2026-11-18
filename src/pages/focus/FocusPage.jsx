import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LuArrowLeft, LuBookOpen, LuBriefcase, LuMaximize, LuMinimize, LuPause, LuPlay, LuRotateCcw } from 'react-icons/lu';
import FocusScene from '@/components/focus/FocusScene';
import LanguageToggle from '@/components/LanguageToggle';
import useCountdown from '@/hooks/useCountdown';
import useViewportSize from '@/hooks/useViewportSize';
import { useI18n } from '@/i18n/I18nProvider';
import { FOCUS_THEMES, STORIES } from '@/data/focusStories';
import { clamp01, formatHour, hourAt, sceneIndexAt } from '@/data/focusStory';
import { playChime } from '@/lib/chime';

const PRESETS = [15, 25, 45, 60, 90];
const MIN_MINUTES = 1;
const MAX_MINUTES = 180;
const DEFAULT_MINUTES = 25;
const STORAGE_KEY = 'kp.focusMinutes';
const THEME_KEY = 'kp.focusTheme';
const THEME_ICONS = { study: LuBookOpen, work: LuBriefcase };
const GLASS = 'border border-white/15 bg-ink-950/45 backdrop-blur-md';

function readMinutes() {
    try {
        const stored = Number(localStorage.getItem(STORAGE_KEY));
        return stored >= MIN_MINUTES && stored <= MAX_MINUTES ? stored : DEFAULT_MINUTES;
    } catch {
        return DEFAULT_MINUTES;
    }
}

function storeMinutes(minutes) {
    try {
        localStorage.setItem(STORAGE_KEY, String(minutes));
    } catch {
        return;
    }
}

function readTheme() {
    try {
        const stored = localStorage.getItem(THEME_KEY);
        return FOCUS_THEMES.includes(stored) ? stored : FOCUS_THEMES[0];
    } catch {
        return FOCUS_THEMES[0];
    }
}

function storeTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch {
        return;
    }
}

function formatClock(remainingMs) {
    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function useFullscreen() {
    const [active, setActive] = useState(() => Boolean(document.fullscreenElement));

    useEffect(() => {
        const sync = () => setActive(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', sync);
        return () => {
            document.removeEventListener('fullscreenchange', sync);
            if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => undefined);
            }
        };
    }, []);

    const toggle = () => {
        const request = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
        request.catch(() => undefined);
    };

    return { active, toggle, supported: document.fullscreenEnabled };
}

export default function FocusPage() {
    const { t, tx } = useI18n();
    const viewport = useViewportSize();
    const fullscreen = useFullscreen();
    const [minutes, setMinutes] = useState(readMinutes);
    const [draft, setDraft] = useState(String(minutes));
    const [theme, setTheme] = useState(readTheme);
    const { status, remainingMs, totalMs, start, pause, reset } = useCountdown(minutes * 60);

    const progress = clamp01(1 - remainingMs / totalMs);
    const running = status === 'running';
    const done = status === 'done';
    const locked = running || status === 'paused';
    const clock = formatClock(remainingMs);
    const story = STORIES[theme];
    const sceneIndex = sceneIndexAt(story.scenes.length, progress);
    const scene = story.scenes[sceneIndex];
    const storyHour = hourAt(story.scenes, progress);

    useEffect(() => {
        if (done) {
            playChime();
        }
    }, [done]);

    useEffect(() => {
        if (!running) {
            return undefined;
        }
        const previous = document.title;
        document.title = `${clock} · ${t('focus.title')}`;
        return () => {
            document.title = previous;
        };
    }, [running, clock, t]);

    useEffect(() => {
        const onKey = (event) => {
            const typing = event.target instanceof HTMLInputElement || event.target instanceof HTMLButtonElement;
            if (event.code !== 'Space' || typing) {
                return;
            }
            event.preventDefault();
            if (running) {
                pause();
            } else {
                start();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [running, start, pause]);

    const applyMinutes = (value) => {
        const next = Math.min(Math.max(Math.round(Number(value)) || DEFAULT_MINUTES, MIN_MINUTES), MAX_MINUTES);
        setMinutes(next);
        setDraft(String(next));
        storeMinutes(next);
    };

    const applyTheme = (next) => {
        setTheme(next);
        storeTheme(next);
    };

    let primary = { label: t('focus.start'), icon: LuPlay, action: start };
    if (running) {
        primary = { label: t('focus.pause'), icon: LuPause, action: pause };
    } else if (status === 'paused') {
        primary = { label: t('focus.resume'), icon: LuPlay, action: start };
    } else if (done) {
        primary = { label: t('focus.again'), icon: LuPlay, action: start };
    }
    const PrimaryIcon = primary.icon;
    const FullscreenIcon = fullscreen.active ? LuMinimize : LuMaximize;

    return (
        <div className="fixed inset-0 z-50 overflow-hidden bg-ink-950 text-white">
            <FocusScene story={story} progress={progress} running={running} viewport={viewport} totalSeconds={minutes * 60} />

            <div className="absolute inset-x-0 top-0 h-1 bg-white/10">
                <div className="h-full bg-brand-400 transition-[width] duration-300" style={{ width: `${progress * 100}%` }} />
            </div>

            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-4 sm:px-6">
                <Link to="/" aria-label={t('common.back')} className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm text-white/90 transition hover:bg-ink-950/70 ${GLASS}`}>
                    <LuArrowLeft size={16} />
                    <span className="hidden sm:inline">{t('common.back')}</span>
                </Link>
                <div className={`flex items-center gap-1 rounded-full p-1 ${GLASS}`} title={locked ? t('focus.locked') : undefined}>
                    {FOCUS_THEMES.map((key) => {
                        const ThemeIcon = THEME_ICONS[key];
                        return (
                            <button
                                key={key}
                                type="button"
                                disabled={locked}
                                aria-pressed={theme === key}
                                onClick={() => applyTheme(key)}
                                aria-label={t(`focus.themes.${key}`)}
                                className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-not-allowed ${theme === key ? 'bg-brand-500 text-ink-950' : 'text-white/75 hover:text-white disabled:opacity-40'}`}
                            >
                                <ThemeIcon size={14} />
                                <span className={theme === key ? '' : 'hidden sm:inline'}>{t(`focus.themes.${key}`)}</span>
                            </button>
                        );
                    })}
                </div>
                <div className="flex items-center gap-2">
                    <LanguageToggle />
                    {fullscreen.supported && (
                        <button
                            type="button"
                            onClick={fullscreen.toggle}
                            aria-label={t(fullscreen.active ? 'focus.exitFullscreen' : 'focus.fullscreen')}
                            title={t(fullscreen.active ? 'focus.exitFullscreen' : 'focus.fullscreen')}
                            className={`grid h-9 w-9 place-items-center rounded-full text-white/90 transition hover:bg-ink-950/70 ${GLASS}`}
                        >
                            <FullscreenIcon size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-[10%] flex flex-col items-center px-4 text-center">
                <div className={`rounded-3xl px-8 py-3 sm:px-12 sm:py-4 ${GLASS}`}>
                    <p className="font-mono font-semibold leading-none tabular-nums tracking-tight" style={{ fontSize: 'clamp(3rem, 9vh, 7.5rem)' }}>{clock}</p>
                    <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-brand-300">{t(`focus.status.${status}`)}</p>
                </div>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={scene.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className={`mt-4 max-w-md rounded-2xl px-5 py-3 lg:absolute lg:left-8 lg:top-0 lg:mt-0 lg:w-80 lg:text-left ${GLASS}`}
                    >
                        <p className="flex items-center justify-center gap-2 font-display text-base font-semibold lg:justify-start">
                            <span className="rounded-full bg-white/15 px-2 py-0.5 font-mono text-xs text-brand-300">{formatHour(storyHour)}</span>
                            {tx(scene.title)}
                        </p>
                        <p className="mt-1 text-sm text-white/80">{tx(scene.text).replace('{n}', String(minutes))}</p>
                        <div className="mt-2 flex items-center justify-center gap-1 lg:justify-start" aria-hidden="true">
                            {story.scenes.map((item, itemIndex) => (
                                <span key={item.id} className={`h-1.5 rounded-full transition-all ${itemIndex === sceneIndex ? 'w-4 bg-brand-400' : itemIndex < sceneIndex ? 'w-1.5 bg-white/60' : 'w-1.5 bg-white/20'}`} />
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className={`absolute inset-x-0 bottom-5 flex flex-col items-center gap-3 px-4 transition-opacity duration-300 ${running ? 'opacity-50 hover:opacity-100 focus-within:opacity-100' : ''}`}>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={primary.action}
                        className="flex items-center gap-2 rounded-full border border-brand-400/60 bg-brand-500 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-black/40 transition hover:bg-brand-400"
                    >
                        <PrimaryIcon size={16} />
                        {primary.label}
                    </button>
                    <button
                        type="button"
                        onClick={reset}
                        disabled={status === 'idle'}
                        className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm text-white/90 transition hover:bg-ink-950/70 disabled:opacity-40 ${GLASS}`}
                    >
                        <LuRotateCcw size={15} />
                        {t('focus.reset')}
                    </button>
                </div>
                <div className={`flex flex-wrap items-center justify-center gap-2 rounded-full px-3 py-2 ${GLASS}`} title={locked ? t('focus.locked') : undefined}>
                    {PRESETS.map((preset) => (
                        <button
                            key={preset}
                            type="button"
                            disabled={locked}
                            onClick={() => applyMinutes(preset)}
                            className={`rounded-full px-3 py-1 font-mono text-sm transition disabled:opacity-40 ${minutes === preset ? 'bg-white/20 text-white' : 'text-white/70 hover:text-white'}`}
                        >
                            {preset}
                        </button>
                    ))}
                    <input
                        type="number"
                        inputMode="numeric"
                        aria-label={t('focus.custom')}
                        min={MIN_MINUTES}
                        max={MAX_MINUTES}
                        value={draft}
                        disabled={locked}
                        onChange={(event) => setDraft(event.target.value)}
                        onBlur={() => applyMinutes(draft)}
                        onKeyDown={(event) => event.key === 'Enter' && event.currentTarget.blur()}
                        className="w-16 rounded-full border border-white/15 bg-transparent px-2 py-1 text-center font-mono text-sm text-white disabled:opacity-40"
                    />
                    <span className="hidden pr-1 font-mono text-xs uppercase tracking-wider text-white/60 sm:inline">{t('focus.minutesShort')}</span>
                </div>
            </div>
        </div>
    );
}
