import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LuCheck, LuChevronDown, LuChevronLeft, LuChevronRight, LuCircleAlert, LuClock, LuLayoutList } from 'react-icons/lu';
import { useI18n } from '@/i18n/I18nProvider';
import { MEAL_SLOTS } from '@/data/foods';
import { addDays, formatShortDate, fromKey, rangeKeys, toKey, weekdayOf } from '@/lib/date';
import { dayTotals, eatingStateFn, mealBase, mealName, planForDate } from '@/lib/nutrition';

const MODES = ['week', 'month'];
const LEGEND = [
    ['bg-brand-500', 'onTarget'],
    ['bg-amber-400', 'over'],
    ['bg-danger', 'surplus'],
];

function rangeOf(mode, anchor) {
    if (mode === 'week') {
        const start = addDays(anchor, -((weekdayOf(anchor) + 6) % 7));
        return { start, end: addDays(start, 6) };
    }
    const date = fromKey(anchor);
    return { start: toKey(new Date(date.getFullYear(), date.getMonth(), 1)), end: toKey(new Date(date.getFullYear(), date.getMonth() + 1, 0)) };
}

function stepAnchor(mode, anchor, direction) {
    if (mode === 'week') {
        return addDays(anchor, direction * 7);
    }
    const date = fromKey(anchor);
    return toKey(new Date(date.getFullYear(), date.getMonth() + direction, 1));
}

function Stat({ label, value, hint, tone = '' }) {
    return (
        <div className="rounded-xl border border-line bg-ink-900/60 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{label}</p>
            <p className={`mt-1 font-display text-2xl font-semibold ${tone}`}>{value}</p>
            {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
        </div>
    );
}

function MealList({ entry }) {
    const { t, tx } = useI18n();
    return (
        <div className="space-y-3 pt-3">
            {MEAL_SLOTS.map((slot) => {
                const meals = entry.meals.filter((meal) => (meal.slot ?? 'snack') === slot);
                if (!meals.length) {
                    return null;
                }
                const subtotal = meals.reduce((sum, meal) => sum + meal.kcal * meal.qty, 0);
                return (
                    <div key={slot}>
                        <p className="mb-1.5 flex justify-between text-[11px] font-semibold uppercase tracking-wider text-faint">
                            <span>{t(`nutrition.slots.${slot}`)}</span>
                            <span className="font-mono">{Math.round(subtotal)} kcal</span>
                        </p>
                        <ul className="space-y-1">
                            {meals.map((meal) => {
                                const base = mealBase(meal);
                                return (
                                    <li key={meal.id} className="flex items-baseline justify-between gap-3 text-sm">
                                        <span className="min-w-0 truncate">{mealName(meal, tx)}</span>
                                        <span className="shrink-0 font-mono text-xs text-muted">
                                            {base ? `${Math.round(meal.qty * base.amount)} ${base.unit} · ` : `×${meal.qty} · `}
                                            {Math.round(meal.kcal * meal.qty)} kcal
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                );
            })}
        </div>
    );
}

function DayRow({ row, ceiling, open, onToggle, onOpenDay }) {
    const { t } = useI18n();
    const date = fromKey(row.key);
    const surplus = row.deficit < 0;
    const over = !surplus && row.eaten > row.target;
    const barTone = surplus ? 'bg-danger' : over ? 'bg-amber-400' : 'bg-brand-500';
    const textTone = surplus ? 'text-danger' : over ? 'text-amber-300' : '';
    const state = row.state.state;
    const empty = !row.logged;

    return (
        <li className={`rounded-xl border ${row.isToday ? 'border-brand-500/50' : 'border-line'} ${empty ? 'bg-transparent' : 'bg-ink-900/50'}`}>
            <button type="button" disabled={empty} onClick={onToggle} className="flex w-full items-center gap-3 px-3 py-2.5 text-left disabled:cursor-default">
                <div className="w-14 shrink-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-faint">{t('weekdays.short')[date.getDay()]}</p>
                    <p className={`font-display text-lg font-semibold leading-tight ${row.isToday ? 'text-brand-300' : empty ? 'text-faint' : ''}`}>{date.getDate()}<span className="ml-1 text-xs font-normal text-faint">/{date.getMonth() + 1}</span></p>
                </div>
                <div className="min-w-0 flex-1">
                    {empty ? (
                        <p className="text-xs text-faint">{row.future ? t('nutrition.overview.future') : t('nutrition.overview.noLog')}</p>
                    ) : (
                        <>
                            <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                                <div className={`h-full rounded-full ${barTone}`} style={{ width: `${Math.min(row.eaten / ceiling, 1) * 100}%` }} />
                            </div>
                            <p className="mt-1 font-mono text-xs text-muted">{t('nutrition.overview.mealsCount', { n: row.entry.meals.length })}</p>
                        </>
                    )}
                </div>
                {!empty && (
                    <>
                        <div className="w-20 shrink-0 text-right">
                            <p className={`font-mono text-sm ${textTone}`}>{Math.round(row.eaten)}</p>
                            <p className="font-mono text-[11px] text-faint">/ {row.target} kcal</p>
                        </div>
                        <div className="w-16 shrink-0 text-right">
                            <p className={`font-mono text-sm ${row.deficit >= 0 ? 'text-brand-300' : 'text-danger'}`}>{row.deficit > 0 ? '+' : ''}{row.deficit}</p>
                            <p className="font-mono text-[11px] text-faint">{t('nutrition.overview.deficitShort')}</p>
                        </div>
                        {row.isToday && <LuClock className="shrink-0 text-faint" size={16} title={t('nutrition.overview.ongoing')} />}
                        {!row.isToday && state === 'kept' && <LuCheck className="shrink-0 text-brand-400" size={16} />}
                        {!row.isToday && state !== 'kept' && <LuCircleAlert className={`shrink-0 ${row.deficit < 0 ? 'text-danger' : 'text-amber-300'}`} size={16} />}
                        <LuChevronDown size={16} className={`shrink-0 text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
                    </>
                )}
            </button>
            {open && !empty && (
                <div className="border-t border-line px-3 pb-3">
                    <MealList entry={row.entry} />
                    <button type="button" onClick={() => onOpenDay(row.key)} className="mt-3 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-sm font-medium text-brand-300 transition hover:bg-brand-500/20">
                        {t('nutrition.overview.openDay')}
                    </button>
                </div>
            )}
        </li>
    );
}

export default function OverviewPanel({ nutrition, plan, today, onOpenDay }) {
    const { t } = useI18n();
    const [mode, setMode] = useState('week');
    const [anchor, setAnchor] = useState(today);
    const [openKey, setOpenKey] = useState(null);

    const range = useMemo(() => rangeOf(mode, anchor), [mode, anchor]);
    const stateOf = useMemo(() => eatingStateFn(nutrition), [nutrition]);
    const rows = useMemo(() => rangeKeys(range.start, range.end).map((key) => {
        const entry = nutrition.days[key] ?? { meals: [], burn: 0, note: '' };
        const dayPlan = planForDate(nutrition, key);
        const logged = entry.meals.length > 0;
        const eaten = dayTotals(entry).kcal;
        return {
            key,
            entry,
            logged,
            eaten,
            target: dayPlan.target,
            deficit: logged ? Math.round(dayPlan.tdee + entry.burn - eaten) : null,
            future: key > today,
            isToday: key === today,
            state: stateOf(key),
        };
    }), [range, nutrition, stateOf, today]);

    const logged = rows.filter((row) => row.logged);
    const counted = rows.filter((row) => row.key <= today).length;
    const totalDeficit = logged.reduce((sum, row) => sum + row.deficit, 0);
    const average = logged.length ? Math.round(logged.reduce((sum, row) => sum + row.eaten, 0) / logged.length) : null;
    const finished = logged.filter((row) => !row.isToday);
    const kept = finished.filter((row) => row.state.state === 'kept').length;
    const ceiling = Math.max(plan.target, ...rows.map((row) => row.target), ...rows.map((row) => row.eaten)) * 1.05;
    const title = mode === 'week' ? `${formatShortDate(range.start, t)} – ${formatShortDate(range.end, t)}` : `${t('months')[fromKey(range.start).getMonth()]} ${fromKey(range.start).getFullYear()}`;
    const signed = (value) => `${value > 0 ? '+' : ''}${value}`;

    const choose = (next) => {
        setMode(next);
        setOpenKey(null);
    };
    const move = (direction) => {
        setAnchor(stepAnchor(mode, anchor, direction));
        setOpenKey(null);
    };

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <LuLayoutList className="text-brand-400" />
                    {t('nutrition.overview.title')}
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="flex gap-1 rounded-xl border border-line bg-ink-900 p-1">
                        {MODES.map((key) => (
                            <button key={key} type="button" onClick={() => choose(key)} className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${mode === key ? 'bg-brand-500 text-ink-950' : 'text-muted hover:text-white'}`}>
                                {t(`nutrition.overview.${key}`)}
                            </button>
                        ))}
                    </div>
                    <button type="button" onClick={() => { setAnchor(today); setOpenKey(null); }} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:text-white">{t('schedule.today')}</button>
                    <button type="button" aria-label="Previous" onClick={() => move(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white"><LuChevronLeft /></button>
                    <button type="button" aria-label="Next" onClick={() => move(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white"><LuChevronRight /></button>
                </div>
            </div>
            <p className="mb-4 font-display text-base font-semibold">{title}</p>

            <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Stat label={t('nutrition.overview.loggedDays')} value={`${logged.length}/${counted}`} hint={t('nutrition.overview.loggedHint')} />
                <Stat label={t('nutrition.overview.average')} value={average == null ? '–' : average} hint={t('nutrition.overview.averageHint', { n: plan.target })} />
                <Stat label={t('nutrition.overview.totalDeficit')} value={logged.length ? signed(totalDeficit) : '–'} hint={logged.length ? t('nutrition.overview.kgHint', { kg: Math.abs(totalDeficit / 7700).toFixed(2), sign: totalDeficit >= 0 ? '−' : '+' }) : undefined} tone={totalDeficit >= 0 ? 'text-brand-300' : 'text-danger'} />
                <Stat label={t('nutrition.overview.keptDays')} value={`${kept}/${finished.length}`} hint={t('nutrition.overview.keptHint')} />
            </div>

            <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
                {LEGEND.map(([tone, key]) => (
                    <span key={key} className="flex items-center gap-1.5">
                        <span className={`h-2 w-5 rounded-full ${tone}`} />
                        {t(`nutrition.overview.legend.${key}`)}
                    </span>
                ))}
            </div>

            <ul className="space-y-1.5">
                {rows.map((row) => (
                    <DayRow
                        key={row.key}
                        row={row}
                        ceiling={ceiling}
                        open={openKey === row.key}
                        onToggle={() => setOpenKey(openKey === row.key ? null : row.key)}
                        onOpenDay={onOpenDay}
                    />
                ))}
            </ul>
        </motion.section>
    );
}
