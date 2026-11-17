import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LuMinus, LuPlus, LuSearch, LuTrash2, LuUtensils } from 'react-icons/lu';
import ProgressRing from '@/components/charts/ProgressRing';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, addMeal, removeMeal, setNutritionDay, setWeight, updateMeal } from '@/store/journalStore';
import { FOODS, MEAL_SLOTS, foodById } from '@/data/foods';
import { dayTotals, mealBase, mealName, verdictOf } from '@/lib/nutrition';

const VERDICT_TONE = {
    empty: 'border-line bg-ink-900/60 text-muted',
    onTrack: 'border-brand-500/40 bg-brand-500/10 text-brand-300',
    small: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    aggressive: 'border-amber-400/30 bg-amber-400/10 text-amber-200',
    surplus: 'border-danger/30 bg-danger/10 text-danger',
    tooLow: 'border-danger/30 bg-danger/10 text-danger',
};

function fold(text) {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
}

function defaultSlot() {
    const hour = new Date().getHours();
    if (hour < 10) {
        return 'breakfast';
    }
    if (hour < 15) {
        return 'lunch';
    }
    return hour < 21 ? 'dinner' : 'snack';
}

function MacroBar({ label, value, target }) {
    const ratio = target ? Math.min(value / target, 1) : 0;
    return (
        <div>
            <div className="mb-1 flex justify-between font-mono text-xs text-muted">
                <span>{label}</span>
                <span>{Math.round(value)}{target ? ` / ${target} g` : ' g'}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                <motion.div className="h-full rounded-full bg-brand-500" initial={{ width: 0 }} animate={{ width: `${ratio * 100}%` }} transition={{ duration: 0.6 }} />
            </div>
        </div>
    );
}

function AmountInput({ value, unit, onCommit }) {
    const { t } = useI18n();
    const [text, setText] = useState(String(value));

    useEffect(() => {
        if (Number(text) !== value) {
            setText(String(value));
        }
    }, [value]);

    const change = (next) => {
        setText(next);
        if (Number(next) > 0) {
            onCommit(Number(next));
        }
    };

    return (
        <div className="relative w-24 shrink-0">
            <input type="number" inputMode="decimal" min="1" step="5" value={text} aria-label={t('nutrition.day.amount')} onChange={(event) => change(event.target.value)} className="field !py-1.5 pr-8 text-right font-mono !text-sm" />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-faint">{unit}</span>
        </div>
    );
}

function AddFood({ date, nutrition }) {
    const { t, tx } = useI18n();
    const [slot, setSlot] = useState(defaultSlot);
    const [query, setQuery] = useState('');
    const [custom, setCustom] = useState({ name: '', amount: '', kcal: '', protein: '', carbs: '', fat: '' });

    const mine = useMemo(() => {
        const seen = new Map();
        Object.entries(nutrition.days).sort(([a], [b]) => b.localeCompare(a)).forEach(([, day]) => {
            day.meals.filter((meal) => !meal.foodId).forEach((meal) => {
                if (!seen.has(meal.name)) {
                    seen.set(meal.name, meal);
                }
            });
        });
        return [...seen.values()].slice(0, 12);
    }, [nutrition.days]);

    const needle = fold(query.trim());
    const results = useMemo(() => {
        const catalog = FOODS.map((food) => ({ key: food.id, food, label: tx(food.name), serving: tx(food.serving), search: fold(`${food.name.vi} ${food.name.en}`) }));
        const own = mine.map((meal) => ({ key: `mine-${meal.name}`, meal, label: meal.name, serving: t('nutrition.day.myFood'), search: fold(meal.name) }));
        return [...own, ...catalog].filter((item) => !needle || item.search.includes(needle)).slice(0, 40);
    }, [needle, mine, t, tx]);

    const pick = (item) => {
        if (item.food) {
            const { food } = item;
            addMeal(date, { slot, foodId: food.id, kcal: food.kcal, protein: food.protein, carbs: food.carbs, fat: food.fat });
        } else {
            const { meal } = item;
            addMeal(date, { slot, name: meal.name, amount: meal.amount, unit: meal.unit, kcal: meal.kcal, protein: meal.protein, carbs: meal.carbs, fat: meal.fat });
        }
    };

    const customValid = custom.name.trim() && Number(custom.kcal) >= 0 && custom.kcal !== '';
    const addCustom = () => {
        addMeal(date, {
            slot,
            name: custom.name.trim(),
            amount: Number(custom.amount) || undefined,
            unit: 'g',
            kcal: Number(custom.kcal),
            protein: Number(custom.protein) || 0,
            carbs: Number(custom.carbs) || 0,
            fat: Number(custom.fat) || 0,
        });
        setCustom({ name: '', amount: '', kcal: '', protein: '', carbs: '', fat: '' });
    };

    return (
        <div className="space-y-4 rounded-2xl border border-line bg-ink-900/40 p-4">
            <div className="flex flex-wrap gap-1.5">
                {MEAL_SLOTS.map((key) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => setSlot(key)}
                        className={`rounded-lg border px-3 py-1.5 text-sm transition ${slot === key ? 'border-brand-500 bg-brand-500/15 text-brand-300' : 'border-line text-muted hover:text-white'}`}
                    >
                        {t(`nutrition.slots.${key}`)}
                    </button>
                ))}
            </div>

            <div className="relative">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('nutrition.day.search')} className="field pl-9" />
            </div>

            <ul className="grid max-h-64 gap-1.5 overflow-y-auto pr-1 sm:grid-cols-2">
                {results.map((item) => {
                    const source = item.food ?? item.meal;
                    return (
                        <li key={item.key}>
                            <button type="button" onClick={() => pick(item)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-left transition hover:border-brand-500/50 hover:bg-brand-500/5">
                                <span className="min-w-0">
                                    <span className="block truncate text-sm font-medium">{item.label}</span>
                                    <span className="block truncate text-xs text-faint">{item.serving}</span>
                                </span>
                                <span className="shrink-0 font-mono text-xs text-brand-300">{source.kcal} kcal</span>
                            </button>
                        </li>
                    );
                })}
                {results.length === 0 && <li className="px-1 py-2 text-sm text-faint">{t('nutrition.day.noMatch')}</li>}
            </ul>

            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">{t('nutrition.day.custom')}</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
                    <input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} placeholder={t('nutrition.day.customName')} className="field col-span-2 sm:col-span-4" />
                    <input type="number" inputMode="decimal" min="0" value={custom.amount} onChange={(event) => setCustom({ ...custom, amount: event.target.value })} placeholder={t('nutrition.day.customAmount')} className="field col-span-2" />
                    {['kcal', 'protein', 'carbs', 'fat'].map((field) => (
                        <input
                            key={field}
                            type="number"
                            inputMode="decimal"
                            min="0"
                            value={custom[field]}
                            onChange={(event) => setCustom({ ...custom, [field]: event.target.value })}
                            placeholder={t(`nutrition.day.${field}`)}
                            className="field"
                        />
                    ))}
                    <button type="button" disabled={!customValid} onClick={addCustom} className="col-span-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-40">
                        {t('nutrition.day.addCustom')}
                    </button>
                </div>
                <p className="mt-2 text-xs text-faint">{t('nutrition.day.customHint')}</p>
            </div>
        </div>
    );
}

function MealRow({ date, meal, locked }) {
    const { t, tx } = useI18n();
    const known = meal.foodId ? foodById(meal.foodId) : null;
    const base = mealBase(meal);
    const setQty = (qty) => updateMeal(date, meal.id, { qty: Math.max(0.5, qty) });
    const setAmount = (amount) => updateMeal(date, meal.id, { qty: Math.round((amount / base.amount) * 10000) / 10000 });

    return (
        <li className="flex items-center gap-3 rounded-xl border border-line bg-ink-900/50 px-3 py-2.5">
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{mealName(meal, tx)}</p>
                <p className="truncate text-xs text-faint">{known ? tx(known.serving) : t('nutrition.day.myFood')}</p>
            </div>
            {!locked && base && <AmountInput value={Math.round(meal.qty * base.amount * 10) / 10} unit={base.unit} onCommit={setAmount} />}
            {!locked && !base && (
                <div className="flex items-center gap-1">
                    <button type="button" aria-label="Less" onClick={() => setQty(meal.qty - 0.5)} className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition hover:text-white"><LuMinus size={13} /></button>
                    <span className="w-9 text-center font-mono text-xs">×{meal.qty}</span>
                    <button type="button" aria-label="More" onClick={() => setQty(meal.qty + 0.5)} className="grid h-7 w-7 place-items-center rounded-lg border border-line text-muted transition hover:text-white"><LuPlus size={13} /></button>
                </div>
            )}
            {locked && <span className="font-mono text-xs text-muted">{base ? `${Math.round(meal.qty * base.amount)} ${base.unit}` : `×${meal.qty}`}</span>}
            <span className="w-20 shrink-0 text-right font-mono text-sm text-brand-300">{Math.round(meal.kcal * meal.qty)} kcal</span>
            {!locked && (
                <button type="button" aria-label="Remove" onClick={() => removeMeal(date, meal.id)} className="grid h-7 w-7 place-items-center rounded-lg text-faint transition hover:text-danger">
                    <LuTrash2 size={15} />
                </button>
            )}
        </li>
    );
}

export default function DayLog({ nutrition, plan, date }) {
    const { t } = useI18n();
    const locked = !JOURNAL_EDITABLE;
    const entry = nutrition.days[date] ?? { meals: [], burn: 0, note: '' };
    const totals = dayTotals(entry);
    const hasMeals = entry.meals.length > 0;
    const verdict = verdictOf(plan, totals.kcal, entry.burn, hasMeals);
    const remaining = plan.target - totals.kcal;

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 p-5 sm:p-6">
            <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
                <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col">
                    <ProgressRing value={totals.kcal / plan.target} size={150} stroke={12} label={t('nutrition.day.eaten')}>
                        <div>
                            <p className="font-display text-3xl font-semibold">{Math.round(totals.kcal)}</p>
                            <p className="font-mono text-[11px] text-faint">/ {plan.target} kcal</p>
                        </div>
                    </ProgressRing>
                    <p className={`font-mono text-sm ${remaining < 0 ? 'text-danger' : 'text-muted'}`}>
                        {remaining >= 0 ? t('nutrition.day.remaining', { n: Math.round(remaining) }) : t('nutrition.day.over', { n: Math.round(-remaining) })}
                    </p>
                </div>

                <div className="space-y-4">
                    <div className={`rounded-xl border p-4 ${VERDICT_TONE[verdict.key]}`}>
                        <p className="font-display font-semibold">{t(`nutrition.verdict.${verdict.key}.title`)}</p>
                        <p className="mt-1 text-sm opacity-90">
                            {t(`nutrition.verdict.${verdict.key}.hint`, { deficit: verdict.deficit, surplus: Math.abs(verdict.deficit), target: plan.deficit, bmr: plan.bmr })}
                        </p>
                        {hasMeals && (
                            <p className="mt-2 font-mono text-xs opacity-80">
                                {t('nutrition.day.formula', { tdee: plan.tdee, burn: entry.burn, eaten: Math.round(totals.kcal), deficit: verdict.deficit })}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <MacroBar label={t('nutrition.plan.protein')} value={totals.protein} target={plan.protein} />
                        <MacroBar label={t('nutrition.plan.carbs')} value={totals.carbs} target={plan.carbs} />
                        <MacroBar label={t('nutrition.plan.fat')} value={totals.fat} target={plan.fat} />
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-faint">{t('nutrition.day.burn')}</span>
                            <input type="number" inputMode="numeric" min="0" step="10" value={entry.burn || ''} disabled={locked} onChange={(event) => setNutritionDay(date, { burn: Number(event.target.value) || 0 })} className="field disabled:opacity-60" placeholder="0" />
                            <span className="mt-1 block text-xs text-faint">{t('nutrition.day.burnHint')}</span>
                        </label>
                        <label className="block">
                            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-faint">{t('nutrition.day.weight')}</span>
                            <input type="number" inputMode="decimal" min="0" step="0.1" value={nutrition.weights[date] ?? ''} disabled={locked} onChange={(event) => setWeight(date, event.target.value)} className="field disabled:opacity-60" placeholder="kg" />
                            <span className="mt-1 block text-xs text-faint">{t('nutrition.day.weightHint')}</span>
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-6 space-y-4">
                <h3 className="flex items-center gap-2 font-display font-semibold">
                    <LuUtensils className="text-brand-400" size={18} />
                    {t('nutrition.day.logTitle')}
                </h3>

                {MEAL_SLOTS.map((slot) => {
                    const meals = entry.meals.filter((meal) => (meal.slot ?? 'snack') === slot);
                    if (!meals.length) {
                        return null;
                    }
                    const subtotal = meals.reduce((sum, meal) => sum + meal.kcal * meal.qty, 0);
                    return (
                        <div key={slot}>
                            <p className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wider text-faint">
                                <span>{t(`nutrition.slots.${slot}`)}</span>
                                <span className="font-mono">{Math.round(subtotal)} kcal</span>
                            </p>
                            <ul className="space-y-1.5">
                                {meals.map((meal) => <MealRow key={meal.id} date={date} meal={meal} locked={locked} />)}
                            </ul>
                        </div>
                    );
                })}
                {!hasMeals && <p className="rounded-xl border border-dashed border-line p-4 text-sm text-muted">{t('nutrition.day.empty')}</p>}

                {!locked && <AddFood date={date} nutrition={nutrition} />}
            </div>
        </motion.section>
    );
}
