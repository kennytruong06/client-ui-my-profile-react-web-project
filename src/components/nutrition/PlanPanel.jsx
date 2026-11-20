import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LuCheck, LuChevronLeft, LuChevronRight, LuClipboardList, LuClock, LuPencil, LuPlus, LuSearch, LuShoppingCart, LuTrash2, LuUndo2 } from 'react-icons/lu';
import AmountField from '@/components/nutrition/AmountField';
import { useI18n } from '@/i18n/I18nProvider';
import { FOODS, MEAL_SLOTS } from '@/data/foods';
import { JOURNAL_EDITABLE, addPlanEntry, removePlanEntry, setMenu, setPlanDone, updatePlanEntry } from '@/store/journalStore';
import { addDays, formatLongDate, weekdayOf } from '@/lib/date';
import { dayTotals, foodBase, foodLabel, foodRefOf, fridgeLeft, plannedTotals, planForDate, portionOf, shoppingItems, splitSuggestion } from '@/lib/nutrition';

const STRIP_RADIUS = 3;
const MAIN_SLOTS = ['breakfast', 'lunch', 'dinner', 'snack'];
const EMPTY_CUSTOM = { name: '', amount: '', kcal: '' };

function fold(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
}

function slotForNow(date, today) {
    if (date !== today) {
        return 'breakfast';
    }
    const hour = new Date().getHours();
    if (hour < 10) {
        return 'breakfast';
    }
    if (hour < 15) {
        return 'lunch';
    }
    return hour < 21 ? 'dinner' : 'snack';
}

function DayStrip({ nutrition, date, today, onSelect }) {
    const { t } = useI18n();
    const keys = Array.from({ length: STRIP_RADIUS * 2 + 1 }, (_, index) => addDays(date, index - STRIP_RADIUS));

    return (
        <div className="mb-4 grid grid-cols-7 gap-1.5">
            {keys.map((key) => {
                const entries = nutrition.plan.filter((entry) => entry.date === key);
                const kcal = Math.round(plannedTotals(entries).kcal);
                const allDone = entries.length > 0 && entries.every((entry) => entry.done);
                const selected = key === date;
                return (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onSelect(key)}
                        className={`relative flex flex-col items-center rounded-xl border px-1 py-2 text-center transition ${selected ? 'border-brand-500 bg-brand-500/15' : 'border-line hover:border-brand-500/40'}`}
                    >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-faint">{t('weekdays.short')[weekdayOf(key)]}</span>
                        <span className={`font-display text-lg font-semibold ${key === today ? 'text-brand-300' : ''}`}>{Number(key.slice(8))}</span>
                        <span className="font-mono text-[10px] text-muted">{kcal > 0 ? kcal : '–'}</span>
                        {allDone && <LuCheck size={12} className="absolute right-1 top-1 text-brand-400" />}
                    </button>
                );
            })}
        </div>
    );
}

function ShoppingList({ nutrition, today }) {
    const { t, tx } = useI18n();
    const items = shoppingItems(nutrition.plan, today, tx);
    if (items.length === 0) {
        return null;
    }
    return (
        <div className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-200">
                <LuShoppingCart size={14} />
                {t('nutrition.menu.shopTitle')}
            </p>
            <ul className="space-y-1">
                {items.map((item) => (
                    <li key={item.key} className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="min-w-0 truncate">{item.label}</span>
                        <span className="shrink-0 font-mono text-xs text-amber-100">{Math.round(item.amount)} {item.unit} · {t('nutrition.menu.forDate', { date: `${Number(item.firstDate.slice(8))}/${Number(item.firstDate.slice(5, 7))}` })}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function MenuHeader({ date, slot, menu, locked }) {
    const { t } = useI18n();
    const [editing, setEditing] = useState(false);
    const hasMenu = Boolean(menu && (menu.title || menu.time || menu.note));

    if (editing && !locked) {
        return (
            <div className="mb-2 space-y-2 rounded-xl border border-line bg-ink-900/60 p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
                    <input value={menu?.title ?? ''} onChange={(event) => setMenu(date, slot, { title: event.target.value })} placeholder={t('nutrition.menu.dishTitle')} className="field" />
                    <input type="time" value={menu?.time ?? ''} onChange={(event) => setMenu(date, slot, { time: event.target.value })} aria-label={t('nutrition.menu.dishTime')} className="field sm:w-32" />
                </div>
                <textarea rows={2} value={menu?.note ?? ''} onChange={(event) => setMenu(date, slot, { note: event.target.value })} placeholder={t('nutrition.menu.dishNote')} className="field" />
                <button type="button" onClick={() => setEditing(false)} className="rounded-lg border border-line px-3 py-1 text-xs text-muted transition hover:text-white">{t('nutrition.menu.doneEditing')}</button>
            </div>
        );
    }

    if (!hasMenu) {
        return locked ? null : (
            <button type="button" onClick={() => setEditing(true)} className="mb-2 flex items-center gap-1.5 rounded-lg border border-dashed border-line px-3 py-1.5 text-xs text-muted transition hover:border-brand-500/50 hover:text-white">
                <LuPencil size={12} />
                {t('nutrition.menu.addDish')}
            </button>
        );
    }

    return (
        <div className="mb-2 rounded-xl border border-brand-500/25 bg-brand-500/5 px-3.5 py-2.5">
            <div className="flex items-start justify-between gap-3">
                <p className="font-display text-base font-semibold leading-snug">{menu.title}</p>
                <div className="flex shrink-0 items-center gap-2">
                    {menu.time && (
                        <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 font-mono text-xs text-brand-300">
                            <LuClock size={11} />
                            {menu.time}
                        </span>
                    )}
                    {!locked && (
                        <button type="button" aria-label={t('nutrition.menu.editDish')} onClick={() => setEditing(true)} className="grid h-6 w-6 place-items-center rounded-md text-faint transition hover:text-white">
                            <LuPencil size={13} />
                        </button>
                    )}
                </div>
            </div>
            {menu.note && <p className="mt-1 text-sm text-muted">{menu.note}</p>}
        </div>
    );
}

function PlanRow({ entry, today, locked }) {
    const { t, tx } = useI18n();
    const [more, setMore] = useState(false);
    const base = foodBase(entry);
    const kcal = Math.round(portionOf(entry, entry.amount).kcal);
    const future = entry.date > today;
    const frozen = locked || entry.done;

    return (
        <li className={`rounded-xl border px-3 py-2 ${entry.done ? 'border-brand-500/40 bg-brand-500/5' : 'border-line bg-ink-900/50'}`}>
            <div className="flex items-center gap-2.5">
                <button
                    type="button"
                    disabled={locked || (future && !entry.done)}
                    aria-pressed={entry.done}
                    aria-label={entry.done ? t('nutrition.menu.undoItem') : t('nutrition.menu.doneItem')}
                    title={future && !entry.done ? t('nutrition.menu.futureHint') : undefined}
                    onClick={() => setPlanDone([entry.id], !entry.done)}
                    className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition disabled:cursor-not-allowed disabled:opacity-40 ${entry.done ? 'border-brand-500 bg-brand-500 text-ink-950' : 'border-white/30 text-transparent hover:border-brand-500/60 hover:text-brand-300'}`}
                >
                    <LuCheck size={13} />
                </button>
                <div className="min-w-0 flex-1">
                    <p className={`text-sm font-medium leading-snug ${entry.done ? 'text-muted line-through' : ''}`}>
                        {foodLabel(entry, tx)}
                        {entry.toBuy && !entry.done && <LuShoppingCart size={12} className="ml-1.5 inline text-amber-300" aria-label={t('nutrition.menu.toBuy')} />}
                    </p>
                    <p className="font-mono text-xs text-faint">{kcal} kcal</p>
                </div>
                <AmountField value={entry.amount} unit={base.unit} disabled={frozen} onCommit={(amount) => updatePlanEntry(entry.id, { amount })} />
                {!frozen && (
                    <>
                        <button type="button" aria-label={t('nutrition.menu.moreEdit')} onClick={() => setMore(!more)} className={`grid h-7 w-7 place-items-center rounded-lg transition ${more ? 'text-brand-300' : 'text-faint hover:text-white'}`}>
                            <LuPencil size={13} />
                        </button>
                        <button type="button" aria-label={t('nutrition.fridge.remove')} onClick={() => removePlanEntry(entry.id)} className="grid h-7 w-7 place-items-center rounded-lg text-faint transition hover:text-danger">
                            <LuTrash2 size={14} />
                        </button>
                    </>
                )}
            </div>
            {more && !frozen && (
                <div className="mt-2 flex flex-wrap items-center gap-2 pl-8">
                    <select value={entry.slot} onChange={(event) => updatePlanEntry(entry.id, { slot: event.target.value })} aria-label={t('nutrition.menu.moveSlot')} className="field !w-auto !py-1 !text-xs">
                        {MEAL_SLOTS.map((slot) => <option key={slot} value={slot}>{t(`nutrition.slots.${slot}`)}</option>)}
                    </select>
                    <input type="date" value={entry.date} onChange={(event) => event.target.value && updatePlanEntry(entry.id, { date: event.target.value })} aria-label={t('nutrition.menu.moveDate')} className="field !w-auto !py-1 !text-xs" />
                    <label className="flex items-center gap-1.5 text-xs text-muted">
                        <input type="checkbox" checked={Boolean(entry.toBuy)} onChange={(event) => updatePlanEntry(entry.id, { toBuy: event.target.checked })} />
                        {t('nutrition.menu.toBuy')}
                    </label>
                </div>
            )}
        </li>
    );
}

function SlotBlock({ date, slot, entries, menu, today, locked }) {
    const { t } = useI18n();
    const allDone = entries.length > 0 && entries.every((entry) => entry.done);
    const doneCount = entries.filter((entry) => entry.done).length;
    const future = date > today;
    const kcal = Math.round(plannedTotals(entries).kcal);

    return (
        <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-faint">
                    {t(`nutrition.slots.${slot}`)}
                    {entries.length > 0 && <span className="ml-1 font-mono normal-case">· {kcal} kcal · {t('nutrition.menu.eatenCount', { done: doneCount, total: entries.length })}</span>}
                </p>
                {entries.length > 0 && (
                    <button
                        type="button"
                        disabled={locked || (future && !allDone)}
                        title={future && !allDone ? t('nutrition.menu.futureHint') : undefined}
                        onClick={() => setPlanDone(entries.map((entry) => entry.id), !allDone)}
                        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 ${allDone ? 'border-line text-muted hover:text-white' : 'border-brand-500/40 bg-brand-500/10 text-brand-300 hover:bg-brand-500/20'}`}
                    >
                        {allDone ? <LuUndo2 size={13} /> : <LuCheck size={13} />}
                        {allDone ? t('nutrition.menu.undoSlot') : t('nutrition.menu.doneSlot')}
                    </button>
                )}
            </div>
            <MenuHeader date={date} slot={slot} menu={menu} locked={locked} />
            {entries.length > 0 ? (
                <ul className="space-y-1.5">
                    {entries.map((entry) => <PlanRow key={entry.id} entry={entry} today={today} locked={locked} />)}
                </ul>
            ) : (
                <p className="rounded-xl border border-dashed border-line px-3 py-2.5 text-sm text-faint">{t('nutrition.menu.slotEmpty', { slot: t(`nutrition.slots.${slot}`).toLowerCase() })}</p>
            )}
        </div>
    );
}

function AddFromFridge({ nutrition, date, slot, today }) {
    const { t, tx } = useI18n();
    const [fridgeId, setFridgeId] = useState('');
    const [amount, setAmount] = useState('');

    const item = nutrition.fridge.find((candidate) => candidate.id === fridgeId) ?? null;
    const left = item ? Math.max(fridgeLeft(item, nutrition.plan, today), 0) : 0;
    const unit = item ? foodBase(item).unit : 'g';

    const pick = (id) => {
        setFridgeId(id);
        const next = nutrition.fridge.find((candidate) => candidate.id === id);
        setAmount(next ? String(Math.max(fridgeLeft(next, nutrition.plan, today), 0)) : '');
    };

    const add = () => {
        if (!item || !(Number(amount) > 0)) {
            return;
        }
        addPlanEntry({ ...foodRefOf(item), fridgeId: item.id, date, slot, amount: Number(amount) });
        setAmount(String(Math.max(left - Number(amount), 0)));
    };

    if (nutrition.fridge.length === 0) {
        return <p className="text-sm text-muted">{t('nutrition.menu.noFridge')}</p>;
    }

    return (
        <div className="space-y-2">
            <select value={fridgeId} onChange={(event) => pick(event.target.value)} aria-label={t('nutrition.menu.pickItem')} className="field">
                <option value="">{t('nutrition.menu.pickItem')}</option>
                {nutrition.fridge.map((candidate) => {
                    const candidateLeft = Math.max(fridgeLeft(candidate, nutrition.plan, today), 0);
                    return <option key={candidate.id} value={candidate.id}>{foodLabel(candidate, tx)} · {candidateLeft}{foodBase(candidate).unit}</option>;
                })}
            </select>
            {item && (
                <div className="flex flex-wrap items-center gap-2">
                    <AmountField value={Number(amount) || 0} unit={unit} onCommit={(next) => setAmount(String(next))} />
                    {[[t('nutrition.menu.quickAll'), 1], ['1/2', 2]].map(([label, parts]) => (
                        <button key={label} type="button" onClick={() => setAmount(String(splitSuggestion(left, parts)))} className="rounded-full border border-line px-2.5 py-1 text-xs text-muted transition hover:border-brand-500/50 hover:text-white">
                            {label}
                        </button>
                    ))}
                    <span className="font-mono text-xs text-faint">{t('nutrition.fridge.left', { n: left, unit })}</span>
                    <button type="button" disabled={!(Number(amount) > 0)} onClick={add} className="ml-auto flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-40">
                        <LuPlus size={15} />
                        {t('nutrition.menu.add')}
                    </button>
                </div>
            )}
        </div>
    );
}

function AddOther({ date, slot }) {
    const { t, tx } = useI18n();
    const [query, setQuery] = useState('');
    const [picked, setPicked] = useState(null);
    const [amount, setAmount] = useState('');
    const [toBuy, setToBuy] = useState(false);
    const [custom, setCustom] = useState(EMPTY_CUSTOM);

    const needle = fold(query.trim());
    const results = useMemo(() => FOODS.filter((food) => needle && fold(`${food.name.vi} ${food.name.en}`).includes(needle)).slice(0, 6), [needle]);

    const choose = (food) => {
        setPicked(food);
        setAmount(String(food.amount));
        setQuery('');
    };

    const addPicked = () => {
        if (!picked || !(Number(amount) > 0)) {
            return;
        }
        addPlanEntry({ foodId: picked.id, fridgeId: null, date, slot, amount: Number(amount), toBuy });
        setPicked(null);
        setAmount('');
    };

    const customValid = custom.name.trim() && Number(custom.amount) > 0 && custom.kcal !== '';
    const addCustom = () => {
        addPlanEntry({ name: custom.name.trim(), unit: 'g', kcal: Number(custom.kcal), protein: 0, carbs: 0, fat: 0, fridgeId: null, date, slot, amount: Number(custom.amount), toBuy });
        setCustom(EMPTY_CUSTOM);
    };

    return (
        <div className="space-y-3">
            <div className="relative">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('nutrition.menu.searchOther')} className="field pl-9" />
            </div>
            {results.length > 0 && (
                <ul className="grid gap-1.5 sm:grid-cols-2">
                    {results.map((food) => (
                        <li key={food.id}>
                            <button type="button" onClick={() => choose(food)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-left text-sm transition hover:border-brand-500/50 hover:bg-brand-500/5">
                                <span className="truncate">{tx(food.name)}</span>
                                <span className="shrink-0 font-mono text-xs text-brand-300">{food.kcal} kcal / {food.amount}{food.unit}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {picked && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand-500/40 bg-brand-500/10 px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{tx(picked.name)}</span>
                    <AmountField value={Number(amount) || 0} unit={picked.unit} onCommit={(next) => setAmount(String(next))} />
                    <button type="button" onClick={addPicked} className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                        <LuPlus size={15} />
                        {t('nutrition.menu.add')}
                    </button>
                </div>
            )}
            <div className="grid grid-cols-2 gap-2">
                <input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} placeholder={t('nutrition.day.customName')} className="field col-span-2" />
                <input type="number" inputMode="decimal" min="0" value={custom.amount} onChange={(event) => setCustom({ ...custom, amount: event.target.value })} placeholder={t('nutrition.day.amount')} className="field" />
                <input type="number" inputMode="decimal" min="0" value={custom.kcal} onChange={(event) => setCustom({ ...custom, kcal: event.target.value })} placeholder={t('nutrition.menu.kcalPer100')} className="field" />
                <button type="button" disabled={!customValid} onClick={addCustom} className="col-span-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-40">
                    {t('nutrition.menu.add')}
                </button>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
                <input type="checkbox" checked={toBuy} onChange={(event) => setToBuy(event.target.checked)} />
                {t('nutrition.menu.markToBuy')}
            </label>
        </div>
    );
}

function AddToPlan({ nutrition, date, today }) {
    const { t } = useI18n();
    const [slot, setSlot] = useState(() => slotForNow(date, today));
    const [mode, setMode] = useState('other');

    return (
        <div className="space-y-3 rounded-2xl border border-line bg-ink-900/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-faint">{t('nutrition.menu.addTitle')}</p>
            <div className="space-y-2">
                <select value={slot} onChange={(event) => setSlot(event.target.value)} aria-label={t('nutrition.menu.moveSlot')} className="field">
                    {MEAL_SLOTS.map((key) => <option key={key} value={key}>{t(`nutrition.slots.${key}`)}</option>)}
                </select>
                <div className="flex gap-1 rounded-xl border border-line bg-ink-900 p-1">
                    {['other', 'fridge'].map((key) => (
                        <button key={key} type="button" onClick={() => setMode(key)} className={`flex-1 whitespace-nowrap rounded-lg px-2 py-1.5 text-sm transition ${mode === key ? 'bg-brand-500 font-semibold text-ink-950' : 'text-muted hover:text-white'}`}>
                            {t(`nutrition.menu.mode.${key}`)}
                        </button>
                    ))}
                </div>
            </div>
            {mode === 'fridge' ? <AddFromFridge nutrition={nutrition} date={date} slot={slot} today={today} /> : <AddOther date={date} slot={slot} />}
        </div>
    );
}

export default function PlanPanel({ nutrition, today }) {
    const { t } = useI18n();
    const locked = !JOURNAL_EDITABLE;
    const [date, setDate] = useState(today);
    const plan = planForDate(nutrition, date);

    const entries = useMemo(() => nutrition.plan.filter((entry) => entry.date === date), [nutrition.plan, date]);
    const eaten = dayTotals(nutrition.days[date]);
    const pending = plannedTotals(entries.filter((entry) => !entry.done));
    const totals = { kcal: eaten.kcal + pending.kcal, protein: eaten.protein + pending.protein, carbs: eaten.carbs + pending.carbs, fat: eaten.fat + pending.fat, fiber: eaten.fiber + pending.fiber };
    const ratio = plan.target ? Math.min(totals.kcal / plan.target, 1) : 0;
    const over = totals.kcal > plan.target;
    const visibleSlots = MEAL_SLOTS.filter((slot) => MAIN_SLOTS.includes(slot) || entries.some((entry) => entry.slot === slot));

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
            <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                    <LuClipboardList className="text-brand-400" />
                    {t('nutrition.menu.title')}
                </h2>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setDate(today)} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:text-white">{t('schedule.today')}</button>
                    <button type="button" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white"><LuChevronLeft /></button>
                    <button type="button" aria-label="Next day" onClick={() => setDate(addDays(date, 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white"><LuChevronRight /></button>
                </div>
            </div>
            <p className="mb-4 text-sm text-muted">{formatLongDate(date, t)}</p>

            <DayStrip nutrition={nutrition} date={date} today={today} onSelect={setDate} />

            <div className={`mb-5 rounded-xl border p-4 ${over ? 'border-danger/30 bg-danger/10' : 'border-line bg-ink-900/60'}`}>
                <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-faint">{t('nutrition.menu.total')}</p>
                    <p className={`font-mono text-sm ${over ? 'text-danger' : 'text-brand-300'}`}>{Math.round(totals.kcal)} / {plan.target} kcal</p>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-800">
                    <div className={`h-full rounded-full transition-all ${over ? 'bg-danger' : 'bg-brand-500'}`} style={{ width: `${ratio * 100}%` }} />
                </div>
                <p className="mt-2 font-mono text-xs text-muted">{t('nutrition.menu.totalSplit', { eaten: Math.round(eaten.kcal), planned: Math.round(pending.kcal) })}</p>
                <p className="mt-1 font-mono text-xs text-muted">
                    {t('nutrition.plan.protein')} {Math.round(totals.protein)}/{plan.protein} g · {t('nutrition.plan.carbs')} {Math.round(totals.carbs)}/{plan.carbs} g · {t('nutrition.plan.fat')} {Math.round(totals.fat)}/{plan.fat} g · {t('nutrition.plan.fiber')} {Math.round(totals.fiber)}/{plan.fiber} g
                </p>
            </div>

            <ShoppingList nutrition={nutrition} today={today} />

            <div className="space-y-5">
                {visibleSlots.map((slot) => (
                    <SlotBlock
                        key={slot}
                        date={date}
                        slot={slot}
                        entries={entries.filter((entry) => entry.slot === slot)}
                        menu={nutrition.menus[`${date}|${slot}`]}
                        today={today}
                        locked={locked}
                    />
                ))}
                {!locked && <AddToPlan key={date} nutrition={nutrition} date={date} today={today} />}
            </div>
        </motion.section>
    );
}
