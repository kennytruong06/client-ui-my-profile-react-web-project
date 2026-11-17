import { motion } from 'framer-motion';
import { LuFlame, LuScale, LuTarget, LuTriangleAlert } from 'react-icons/lu';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, saveProfile } from '@/store/journalStore';
import { ACTIVITY_LEVELS, LOSS_RATES, currentWeightKg, emptyProfile, planOf, profileReady } from '@/lib/nutrition';
import { addDays, formatShortDate, todayKey } from '@/lib/date';

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-faint">{label}</span>
            {children}
        </label>
    );
}

function NumberInput({ value, onChange, unit, locked, step = 1 }) {
    return (
        <div className="relative">
            <input type="number" inputMode="decimal" min="0" step={step} value={value} disabled={locked} onChange={(event) => onChange(event.target.value)} className="field pr-12 disabled:opacity-60" />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-faint">{unit}</span>
        </div>
    );
}

function Metric({ label, value, unit, hint, tone = '' }) {
    return (
        <div className="rounded-xl border border-line bg-ink-900/60 p-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-faint">{label}</p>
            <p className={`mt-1 font-display text-2xl font-semibold ${tone}`}>
                {value}
                {unit && <span className="ml-1 text-sm font-normal text-faint">{unit}</span>}
            </p>
            {hint && <p className="mt-1 text-xs text-faint">{hint}</p>}
        </div>
    );
}

export default function ProfilePanel({ nutrition }) {
    const { t } = useI18n();
    const profile = { ...emptyProfile(), ...nutrition.profile };
    const locked = !JOURNAL_EDITABLE;
    const ready = profileReady(profile);
    const weight = currentWeightKg(nutrition);
    const plan = ready ? planOf(profile, weight) : null;
    const set = (patch) => saveProfile(patch);

    return (
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 grid gap-6 p-5 sm:p-6 lg:grid-cols-[1fr_1.2fr]">
            <div>
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                    <LuScale className="text-brand-400" />
                    {t('nutrition.body.title')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                    <Field label={t('nutrition.body.sex')}>
                        <div className="flex gap-1 rounded-xl border border-line bg-ink-900 p-1">
                            {['male', 'female'].map((sex) => (
                                <button
                                    key={sex}
                                    type="button"
                                    disabled={locked}
                                    onClick={() => set({ sex })}
                                    className={`flex-1 rounded-lg px-2 py-1.5 text-sm font-medium transition ${profile.sex === sex ? 'bg-brand-500 text-ink-950' : 'text-muted hover:text-white'}`}
                                >
                                    {t(`nutrition.body.${sex}`)}
                                </button>
                            ))}
                        </div>
                    </Field>
                    <Field label={t('nutrition.body.age')}>
                        <NumberInput value={profile.age} onChange={(age) => set({ age })} unit={t('nutrition.body.ageUnit')} locked={locked} />
                    </Field>
                    <Field label={t('nutrition.body.height')}>
                        <NumberInput value={profile.heightCm} onChange={(heightCm) => set({ heightCm })} unit="cm" locked={locked} />
                    </Field>
                    <Field label={t('nutrition.body.weight')}>
                        <NumberInput value={profile.weightKg} onChange={(weightKg) => set({ weightKg })} unit="kg" locked={locked} step={0.1} />
                    </Field>
                    <Field label={t('nutrition.body.goal')}>
                        <NumberInput value={profile.goalKg} onChange={(goalKg) => set({ goalKg })} unit="kg" locked={locked} step={0.1} />
                    </Field>
                    <div className="col-span-2">
                        <Field label={t('nutrition.body.activity')}>
                            <select value={profile.activity} disabled={locked} onChange={(event) => set({ activity: event.target.value })} className="field disabled:opacity-60">
                                {Object.keys(ACTIVITY_LEVELS).map((level) => (
                                    <option key={level} value={level}>{t(`nutrition.body.activityLevels.${level}`)}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>
                <div className="mt-3">
                    <Field label={t('nutrition.body.lossRate')}>
                        <div className="flex flex-wrap gap-1.5">
                            {LOSS_RATES.map((rate) => (
                                <button
                                    key={rate}
                                    type="button"
                                    disabled={locked}
                                    onClick={() => set({ lossRate: rate })}
                                    className={`rounded-lg border px-3 py-1.5 font-mono text-sm transition ${Number(profile.lossRate) === rate ? 'border-brand-500 bg-brand-500/15 text-brand-300' : 'border-line text-muted hover:text-white'}`}
                                >
                                    {t('nutrition.body.perWeek', { n: rate })}
                                </button>
                            ))}
                        </div>
                    </Field>
                </div>
            </div>

            <div>
                <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                    <LuTarget className="text-brand-400" />
                    {t('nutrition.plan.title')}
                </h2>
                {!plan ? (
                    <p className="rounded-xl border border-dashed border-line p-5 text-sm text-muted">{t('nutrition.body.fillHint')}</p>
                ) : (
                    <div className="space-y-3">
                        <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-brand-500/10 p-4">
                            <p className="text-xs font-semibold uppercase tracking-wider text-brand-300">{t('nutrition.plan.target')}</p>
                            <p className="mt-1 flex items-center gap-2 font-display text-4xl font-semibold">
                                <LuFlame className="text-orange-400" size={30} />
                                {plan.target}
                                <span className="text-base font-normal text-muted">kcal</span>
                            </p>
                            <p className="mt-1 text-sm text-muted">{t('nutrition.plan.deficitHint', { n: plan.deficit, kg: plan.weeklyKg.toFixed(2) })}</p>
                        </div>
                        {plan.clamped && (
                            <p className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
                                <LuTriangleAlert className="mt-0.5 shrink-0" size={16} />
                                {t('nutrition.plan.clamped')}
                            </p>
                        )}
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <Metric label={t('nutrition.plan.bmr')} value={plan.bmr} unit="kcal" hint={t('nutrition.plan.bmrHint')} />
                            <Metric label={t('nutrition.plan.tdee')} value={plan.tdee} unit="kcal" hint={t('nutrition.plan.tdeeHint')} />
                            <Metric label={t('nutrition.plan.bmi')} value={plan.bmi ? plan.bmi.toFixed(1) : '—'} hint={t('nutrition.plan.weightNow', { kg: weight })} />
                            <Metric label={t('nutrition.plan.protein')} value={plan.protein} unit="g" />
                            <Metric label={t('nutrition.plan.carbs')} value={plan.carbs} unit="g" />
                            <Metric label={t('nutrition.plan.fat')} value={plan.fat} unit="g" />
                        </div>
                        <p className="text-sm text-muted">
                            {Number(profile.goalKg) > 0
                                ? plan.toLose > 0
                                    ? plan.weeksToGoal
                                        ? t('nutrition.plan.eta', { kg: plan.toLose.toFixed(1), weeks: plan.weeksToGoal, date: formatShortDate(addDays(todayKey(), plan.weeksToGoal * 7), t) })
                                        : t('nutrition.plan.noEta')
                                    : t('nutrition.plan.reached')
                                : t('nutrition.plan.noGoal')}
                        </p>
                    </div>
                )}
            </div>
        </motion.section>
    );
}
