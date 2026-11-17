import { createPortal } from 'react-dom';
import { useI18n } from '@/i18n/I18nProvider';
import { MEAL_SLOTS } from '@/data/foods';
import { formatLongDate } from '@/lib/date';
import { dayTotals, mealBase, mealName, verdictOf } from '@/lib/nutrition';

const round1 = (value) => Math.round(value * 10) / 10;

function Stat({ label, value, unit }) {
    return (
        <div className="rounded-lg border border-gray-300 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</p>
            <p className="mt-0.5 text-xl font-semibold">{value}<span className="ml-1 text-xs font-normal text-gray-500">{unit}</span></p>
        </div>
    );
}

export default function DayReport({ nutrition, plan, date }) {
    const { t, tx } = useI18n();
    const entry = nutrition.days[date] ?? { meals: [], burn: 0, note: '' };
    const totals = dayTotals(entry);
    const hasMeals = entry.meals.length > 0;
    const verdict = verdictOf(plan, totals.kcal, entry.burn, hasMeals);
    const weight = nutrition.weights[date];
    const macros = [
        { key: 'protein', eaten: totals.protein, target: plan.protein },
        { key: 'carbs', eaten: totals.carbs, target: plan.carbs },
        { key: 'fat', eaten: totals.fat, target: plan.fat },
    ];

    return createPortal(
        <article className="print-sheet hidden bg-white font-sans text-sm text-black print:block">
            <header className="mb-5 border-b-2 border-black pb-3">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">{t('nutrition.export.title')}</p>
                <h1 className="mt-1 text-2xl font-bold">{formatLongDate(date, t)}</h1>
            </header>

            <section className="mb-5 grid grid-cols-4 gap-3">
                <Stat label={t('nutrition.export.eaten')} value={Math.round(totals.kcal)} unit="kcal" />
                <Stat label={t('nutrition.export.target')} value={plan.target} unit="kcal" />
                <Stat label={t('nutrition.export.burned')} value={plan.tdee + entry.burn} unit="kcal" />
                <Stat label={t('nutrition.export.deficit')} value={verdict.deficit} unit="kcal" />
            </section>

            <section className="mb-5 rounded-lg border border-gray-300 px-4 py-3">
                <p className="font-semibold">{t(`nutrition.verdict.${verdict.key}.title`)}</p>
                <p className="mt-1 text-gray-700">
                    {t(`nutrition.verdict.${verdict.key}.hint`, { deficit: verdict.deficit, surplus: Math.abs(verdict.deficit), target: plan.deficit, bmr: plan.bmr })}
                </p>
                {hasMeals && (
                    <p className="mt-2 font-mono text-xs text-gray-600">
                        {t('nutrition.day.formula', { tdee: plan.tdee, burn: entry.burn, eaten: Math.round(totals.kcal), deficit: verdict.deficit })}
                    </p>
                )}
            </section>

            <section className="mb-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('nutrition.export.macros')}</h2>
                <div className="grid grid-cols-3 gap-3">
                    {macros.map((macro) => (
                        <div key={macro.key}>
                            <div className="flex justify-between text-xs">
                                <span>{t(`nutrition.plan.${macro.key}`)}</span>
                                <span className="font-mono">{Math.round(macro.eaten)} / {macro.target} g</span>
                            </div>
                            <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-200 [print-color-adjust:exact]">
                                <div className="h-full rounded-full bg-gray-800 [print-color-adjust:exact]" style={{ width: `${Math.min(macro.eaten / macro.target, 1) * 100}%` }} />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mb-5">
                <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">{t('nutrition.day.logTitle')}</h2>
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-black text-xs uppercase tracking-wider text-gray-500">
                            <th className="py-1.5 font-semibold">{t('nutrition.export.food')}</th>
                            <th className="py-1.5 text-right font-semibold">{t('nutrition.export.amount')}</th>
                            <th className="py-1.5 text-right font-semibold">kcal</th>
                            <th className="py-1.5 text-right font-semibold">{t('nutrition.plan.protein')}</th>
                            <th className="py-1.5 text-right font-semibold">{t('nutrition.plan.carbs')}</th>
                            <th className="py-1.5 text-right font-semibold">{t('nutrition.plan.fat')}</th>
                        </tr>
                    </thead>
                    {MEAL_SLOTS.map((slot) => {
                        const meals = entry.meals.filter((meal) => (meal.slot ?? 'snack') === slot);
                        if (!meals.length) {
                            return null;
                        }
                        const subtotal = meals.reduce((sum, meal) => sum + meal.kcal * meal.qty, 0);
                        return (
                            <tbody key={slot} className="break-inside-avoid">
                                <tr className="bg-gray-100 [print-color-adjust:exact]">
                                    <td colSpan={2} className="px-2 py-1 text-xs font-semibold uppercase tracking-wider">{t(`nutrition.slots.${slot}`)}</td>
                                    <td className="py-1 text-right font-mono text-xs font-semibold">{Math.round(subtotal)}</td>
                                    <td colSpan={3} />
                                </tr>
                                {meals.map((meal) => {
                                    const base = mealBase(meal);
                                    return (
                                        <tr key={meal.id} className="break-inside-avoid border-b border-gray-200">
                                            <td className="py-1.5 pr-2">{mealName(meal, tx)}</td>
                                            <td className="py-1.5 text-right font-mono text-xs">{base ? `${round1(meal.qty * base.amount)} ${base.unit}` : `×${meal.qty}`}</td>
                                            <td className="py-1.5 text-right font-mono text-xs">{Math.round(meal.kcal * meal.qty)}</td>
                                            <td className="py-1.5 text-right font-mono text-xs">{round1((meal.protein ?? 0) * meal.qty)}</td>
                                            <td className="py-1.5 text-right font-mono text-xs">{round1((meal.carbs ?? 0) * meal.qty)}</td>
                                            <td className="py-1.5 text-right font-mono text-xs">{round1((meal.fat ?? 0) * meal.qty)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        );
                    })}
                    <tfoot>
                        <tr className="border-t-2 border-black font-semibold">
                            <td colSpan={2} className="py-2">{t('nutrition.export.total')}</td>
                            <td className="py-2 text-right font-mono text-xs">{Math.round(totals.kcal)}</td>
                            <td className="py-2 text-right font-mono text-xs">{round1(totals.protein)}</td>
                            <td className="py-2 text-right font-mono text-xs">{round1(totals.carbs)}</td>
                            <td className="py-2 text-right font-mono text-xs">{round1(totals.fat)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            {(weight || entry.note) && (
                <section className="mb-5 space-y-1 text-gray-800">
                    {weight && <p><span className="font-semibold">{t('nutrition.export.weight')}:</span> {weight} kg</p>}
                    {entry.note && <p><span className="font-semibold">{t('nutrition.export.note')}:</span> {entry.note}</p>}
                </section>
            )}

            <footer className="border-t border-gray-300 pt-2 text-xs text-gray-500">{t('nutrition.export.footer')}</footer>
        </article>,
        document.body,
    );
}
