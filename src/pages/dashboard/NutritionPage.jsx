import { useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuFileDown } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import ProfilePanel from '@/components/nutrition/ProfilePanel';
import DayLog from '@/components/nutrition/DayLog';
import DayReport from '@/components/nutrition/DayReport';
import WeekPanel from '@/components/nutrition/WeekPanel';
import { useI18n } from '@/i18n/I18nProvider';
import { useJournal } from '@/store/journalStore';
import { addDays, formatLongDate, todayKey } from '@/lib/date';
import { currentWeightKg, planOf, profileReady } from '@/lib/nutrition';
import { printPdf } from '@/lib/printPdf';

export default function NutritionPage() {
    const { t } = useI18n();
    const { nutrition } = useJournal();
    const today = todayKey();
    const [date, setDate] = useState(today);
    const ready = profileReady(nutrition.profile);
    const plan = ready ? planOf(nutrition.profile, currentWeightKg(nutrition)) : null;
    const hasMeals = (nutrition.days[date]?.meals.length ?? 0) > 0;

    return (
        <div>
            <PageHeader eyebrow={t('nutrition.eyebrow')} title={t('nutrition.title')} subtitle={t('nutrition.subtitle')} />

            <ProfilePanel nutrition={nutrition} />

            {plan && (
                <>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="font-display text-lg font-semibold">{formatLongDate(date, t)}</p>
                        <div className="flex flex-wrap items-center gap-2">
                            <input type="date" aria-label="Date" value={date} max={today} onChange={(event) => event.target.value && setDate(event.target.value)} className="field w-auto !py-1.5" />
                            <button
                                type="button"
                                disabled={!hasMeals}
                                title={hasMeals ? t('nutrition.export.hint') : t('nutrition.export.emptyHint')}
                                onClick={() => printPdf(`${t('nutrition.export.fileName')}-${date}`)}
                                className="flex items-center gap-2 rounded-lg border border-brand-500/40 bg-brand-500/10 px-3 py-1.5 text-sm font-medium text-brand-300 transition hover:bg-brand-500/20 disabled:opacity-40"
                            >
                                <LuFileDown size={15} />
                                {t('nutrition.export.button')}
                            </button>
                            <button type="button" onClick={() => setDate(today)} className="rounded-lg border border-line px-3 py-1.5 text-sm text-muted transition hover:text-white">{t('schedule.today')}</button>
                            <button type="button" aria-label="Previous day" onClick={() => setDate(addDays(date, -1))} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white"><LuChevronLeft /></button>
                            <button type="button" aria-label="Next day" disabled={date >= today} onClick={() => setDate(addDays(date, 1))} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition hover:text-white disabled:opacity-30"><LuChevronRight /></button>
                        </div>
                    </div>
                    <DayLog nutrition={nutrition} plan={plan} date={date} />
                    <WeekPanel nutrition={nutrition} plan={plan} endDate={date} />
                    <DayReport nutrition={nutrition} plan={plan} date={date} />
                </>
            )}
        </div>
    );
}
