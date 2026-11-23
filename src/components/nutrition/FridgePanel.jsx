import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { LuHourglass, LuPlus, LuRefrigerator, LuSearch, LuSparkles, LuTrash2 } from 'react-icons/lu';
import AmountField from '@/components/nutrition/AmountField';
import { useI18n } from '@/i18n/I18nProvider';
import { FOODS } from '@/data/foods';
import { JOURNAL_EDITABLE, addFridgeItem, removeFridgeItem, updateFridgeItem } from '@/store/journalStore';
import { foodBase, foodLabel, fridgeLeft, piecesOf, portionOf } from '@/lib/nutrition';

const EMPTY_CUSTOM = { name: '', amount: '', unit: 'g', kcal: '', protein: '', carbs: '', fat: '', fiber: '' };

function fold(text) {
    return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').toLowerCase();
}

function FridgeRow({ item, left, locked }) {
    const { t, tx } = useI18n();
    const base = foodBase(item);
    const reserved = Math.round((item.amount - left) * 10) / 10;
    const short = left < 0;
    const kcal = Math.round(portionOf(item, item.amount).kcal);
    const totalPieces = piecesOf(item, item.amount);
    const leftPieces = piecesOf(item, Math.max(left, 0));

    return (
        <li className={`rounded-xl border px-3 py-2.5 ${short ? 'border-danger/40 bg-danger/5' : item.old ? 'border-amber-400/40 bg-amber-400/5' : item.new ? 'border-emerald-400/40 bg-emerald-400/5' : 'border-line bg-ink-900/50'}`}>
            <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{foodLabel(item, tx)}</p>
                    <p className="font-mono text-xs text-faint">
                        {kcal} kcal
                        {totalPieces != null && ` · ${t('nutrition.fridge.pieces', { n: totalPieces, unit: item.pieceUnit })}`}
                    </p>
                    {item.old && <p className="font-mono text-xs font-semibold text-amber-300">{t('nutrition.fridge.old')}</p>}
                    {item.new && <p className="font-mono text-xs font-semibold text-emerald-300">{t('nutrition.fridge.new')}</p>}
                </div>
                <AmountField value={item.amount} unit={base.unit} disabled={locked} onCommit={(amount) => updateFridgeItem(item.id, { amount })} />
                {!locked && (
                    <button
                        type="button"
                        aria-label={item.old ? t('nutrition.fridge.unmarkOld') : t('nutrition.fridge.markOld')}
                        title={item.old ? t('nutrition.fridge.unmarkOld') : t('nutrition.fridge.markOld')}
                        onClick={() => updateFridgeItem(item.id, { old: !item.old, new: false })}
                        className={`grid h-7 w-7 place-items-center rounded-lg transition ${item.old ? 'text-amber-300' : 'text-faint hover:text-amber-300'}`}
                    >
                        <LuHourglass size={15} />
                    </button>
                )}
                {!locked && (
                    <button
                        type="button"
                        aria-label={item.new ? t('nutrition.fridge.unmarkNew') : t('nutrition.fridge.markNew')}
                        title={item.new ? t('nutrition.fridge.unmarkNew') : t('nutrition.fridge.markNew')}
                        onClick={() => updateFridgeItem(item.id, { new: !item.new, old: false })}
                        className={`grid h-7 w-7 place-items-center rounded-lg transition ${item.new ? 'text-emerald-300' : 'text-faint hover:text-emerald-300'}`}
                    >
                        <LuSparkles size={15} />
                    </button>
                )}
                {!locked && (
                    <button type="button" aria-label={t('nutrition.fridge.remove')} onClick={() => removeFridgeItem(item.id)} className="grid h-7 w-7 place-items-center rounded-lg text-faint transition hover:text-danger">
                        <LuTrash2 size={15} />
                    </button>
                )}
            </div>
            <p className={`mt-1.5 font-mono text-xs ${short ? 'text-danger' : 'text-muted'}`}>
                {short
                    ? t('nutrition.fridge.short', { n: Math.abs(left), unit: base.unit })
                    : t('nutrition.fridge.left', { n: left, unit: base.unit })}
                {leftPieces != null && !short && ` (${t('nutrition.fridge.pieces', { n: leftPieces, unit: item.pieceUnit })})`}
                {reserved > 0 && ` · ${t('nutrition.fridge.reserved', { n: reserved, unit: base.unit })}`}
            </p>
            {locked && item.note && <p className="mt-1.5 text-xs text-muted">{item.note}</p>}
            {!locked && (
                <textarea
                    key={item.note ?? ''}
                    rows={2}
                    defaultValue={item.note ?? ''}
                    placeholder={t('nutrition.fridge.notePlaceholder')}
                    onBlur={(event) => event.target.value !== (item.note ?? '') && updateFridgeItem(item.id, { note: event.target.value.trim() })}
                    className="field field-sizing-content mt-2 resize-y !py-1.5 text-xs"
                />
            )}
        </li>
    );
}

function AddFood() {
    const { t, tx } = useI18n();
    const [query, setQuery] = useState('');
    const [picked, setPicked] = useState(null);
    const [amount, setAmount] = useState('');
    const [custom, setCustom] = useState(EMPTY_CUSTOM);

    const needle = fold(query.trim());
    const results = useMemo(() => FOODS
        .filter((food) => needle && fold(`${food.name.vi} ${food.name.en}`).includes(needle))
        .slice(0, 8), [needle]);

    const choose = (food) => {
        setPicked(food);
        setAmount(String(food.amount));
        setQuery('');
    };

    const addPicked = () => {
        if (!picked || !(Number(amount) > 0)) {
            return;
        }
        addFridgeItem({ foodId: picked.id, amount: Number(amount) });
        setPicked(null);
        setAmount('');
    };

    const customValid = custom.name.trim() && Number(custom.amount) > 0 && custom.kcal !== '' && Number(custom.kcal) >= 0;
    const addCustom = () => {
        addFridgeItem({
            name: custom.name.trim(),
            unit: custom.unit,
            amount: Number(custom.amount),
            kcal: Number(custom.kcal),
            protein: Number(custom.protein) || 0,
            carbs: Number(custom.carbs) || 0,
            fat: Number(custom.fat) || 0,
            fiber: Number(custom.fiber) || 0,
        });
        setCustom(EMPTY_CUSTOM);
    };

    return (
        <div className="space-y-4 rounded-2xl border border-line bg-ink-900/40 p-4">
            <div className="relative">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" size={16} />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('nutrition.fridge.search')} className="field pl-9" />
            </div>

            {results.length > 0 && (
                <ul className="grid gap-1.5 sm:grid-cols-2">
                    {results.map((food) => (
                        <li key={food.id}>
                            <button type="button" onClick={() => choose(food)} className="flex w-full items-center justify-between gap-3 rounded-xl border border-line px-3 py-2 text-left transition hover:border-brand-500/50 hover:bg-brand-500/5">
                                <span className="truncate text-sm font-medium">{tx(food.name)}</span>
                                <span className="shrink-0 font-mono text-xs text-brand-300">{food.kcal} kcal / {food.amount}{food.unit}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {picked && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-500/40 bg-brand-500/10 px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{tx(picked.name)}</span>
                    <AmountField value={Number(amount) || 0} unit={picked.unit} onCommit={(next) => setAmount(String(next))} />
                    <button type="button" onClick={addPicked} className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                        <LuPlus size={15} />
                        {t('nutrition.fridge.add')}
                    </button>
                </div>
            )}

            <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-faint">{t('nutrition.fridge.custom')}</p>
                <div className="grid grid-cols-2 gap-2">
                    <input value={custom.name} onChange={(event) => setCustom({ ...custom, name: event.target.value })} placeholder={t('nutrition.day.customName')} className="field col-span-2" />
                    <input type="number" inputMode="decimal" min="0" value={custom.amount} onChange={(event) => setCustom({ ...custom, amount: event.target.value })} placeholder={t('nutrition.day.amount')} className="field" />
                    <select value={custom.unit} onChange={(event) => setCustom({ ...custom, unit: event.target.value })} className="field" aria-label={t('nutrition.fridge.unit')}>
                        <option value="g">g</option>
                        <option value="ml">ml</option>
                    </select>
                    {['kcal', 'protein', 'carbs', 'fat', 'fiber'].map((field) => (
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
                    <button type="button" disabled={!customValid} onClick={addCustom} className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-40">
                        {t('nutrition.fridge.add')}
                    </button>
                </div>
                <p className="mt-2 text-xs text-faint">{t('nutrition.fridge.customHint')}</p>
            </div>
        </div>
    );
}

function FridgeGroup({ title, tone, items, nutrition, today, locked }) {
    if (items.length === 0) {
        return null;
    }

    return (
        <div className="mb-4">
            <p className={`mb-2 text-xs font-semibold uppercase tracking-wider ${tone}`}>{title} · {items.length}</p>
            <ul className="space-y-2">
                {items.map((item) => <FridgeRow key={item.id} item={item} left={fridgeLeft(item, nutrition.plan, today)} locked={locked} />)}
            </ul>
        </div>
    );
}

export default function FridgePanel({ nutrition, today }) {
    const { t } = useI18n();
    const locked = !JOURNAL_EDITABLE;

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card p-5 sm:p-6">
            <h2 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
                <LuRefrigerator className="text-brand-400" />
                {t('nutrition.fridge.title')}
            </h2>
            <p className="mb-4 text-sm text-muted">{t('nutrition.fridge.subtitle')}</p>

            {nutrition.fridge.length === 0 ? (
                <p className="mb-4 rounded-xl border border-dashed border-line p-4 text-sm text-muted">{t('nutrition.fridge.empty')}</p>
            ) : (
                <>
                    <FridgeGroup title={t('nutrition.fridge.sectionNew')} tone="text-emerald-300" items={nutrition.fridge.filter((item) => item.new)} nutrition={nutrition} today={today} locked={locked} />
                    <FridgeGroup title={t('nutrition.fridge.sectionOld')} tone="text-amber-300" items={nutrition.fridge.filter((item) => item.old && !item.new)} nutrition={nutrition} today={today} locked={locked} />
                    <FridgeGroup title={t('nutrition.fridge.sectionOther')} tone="text-faint" items={nutrition.fridge.filter((item) => !item.old && !item.new)} nutrition={nutrition} today={today} locked={locked} />
                </>
            )}

            {!locked && <AddFood />}
        </motion.section>
    );
}
