import { motion } from 'framer-motion';
import { LuCloud, LuCloudDrizzle, LuCloudFog, LuCloudLightning, LuCloudRain, LuCloudRainWind, LuDroplets, LuInfo, LuSun, LuThermometer } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import { useI18n } from '@/i18n/I18nProvider';
import { sessionsMinutes, useJournal } from '@/store/journalStore';
import { TRAINING_DAYS, TRAINING_FROM, TRAINING_TO, moveSeconds, optionStats, roundSeconds } from '@/data/training';
import { endTime, formatDuration, formatLongDate, fromKey, rangeKeys, todayKey } from '@/lib/date';
import { currentWeightKg } from '@/lib/nutrition';
import { isRainy, useForecast, weatherKind } from '@/lib/weather';

const WEATHER_ICONS = {
    clear: LuSun,
    cloudy: LuCloud,
    fog: LuCloudFog,
    drizzle: LuCloudDrizzle,
    rain: LuCloudRain,
    showers: LuCloudRainWind,
    storm: LuCloudLightning,
};

function WeatherIcon({ day, size = 16, className = '' }) {
    const Icon = WEATHER_ICONS[weatherKind(day.code)];
    return <Icon size={size} className={className} />;
}

function ForecastStrip({ keys, days, today }) {
    const { t } = useI18n();
    return (
        <div className="mb-8 grid grid-cols-3 gap-2 sm:grid-cols-9">
            {keys.map((key) => {
                const day = days[key];
                const date = fromKey(key);
                const rainy = day ? isRainy(day) : null;
                const tone = rainy == null ? 'border-line text-faint' : rainy ? 'border-sky-400/30 bg-sky-400/10 text-sky-200' : 'border-amber-300/40 bg-amber-300/10 text-amber-100';
                return (
                    <a key={key} href={`#day-${key}`} className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 transition hover:border-brand-500/60 ${tone} ${key === today ? 'ring-2 ring-brand-500/40' : ''}`}>
                        <span className="text-[11px] font-semibold uppercase tracking-wider">{t('weekdays.short')[date.getDay()]} {date.getDate()}/{date.getMonth() + 1}</span>
                        {day ? <WeatherIcon day={day} size={22} /> : <span className="h-[22px] font-mono text-xs leading-[22px]">–</span>}
                        <span className="font-mono text-[11px]">{day ? `${day.chance}%` : '–'}</span>
                    </a>
                );
            })}
        </div>
    );
}

function WeatherLine({ day }) {
    const { t } = useI18n();
    const rainy = isRainy(day);
    return (
        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border px-3 py-2 text-sm ${rainy ? 'border-sky-400/30 bg-sky-400/10 text-sky-100' : 'border-amber-300/40 bg-amber-300/10 text-amber-100'}`}>
            <span className="flex items-center gap-1.5 font-medium">
                <WeatherIcon day={day} />
                {t('training.city')} · {t(`training.weather.${weatherKind(day.code)}`)}
            </span>
            <span className="flex items-center gap-1 font-mono text-xs">
                <LuDroplets size={13} />
                {t('training.rain', { mm: day.rain, n: day.chance })}
            </span>
            <span className="flex items-center gap-1 font-mono text-xs">
                <LuThermometer size={13} />
                {Math.round(day.min)}–{Math.round(day.max)}°C
            </span>
        </div>
    );
}

function useClock() {
    const { t } = useI18n();
    return (seconds) => {
        const total = Math.round(seconds);
        const hours = Math.floor(total / 3600);
        const minutes = Math.floor((total % 3600) / 60);
        const rest = total % 60;
        return [
            hours && t('training.time.h', { n: hours }),
            minutes && t('training.time.m', { n: minutes }),
            rest && t('training.time.s', { n: rest }),
        ].filter(Boolean).join(' ') || t('training.time.s', { n: 0 });
    };
}

const toMinutes = (seconds) => Math.round(seconds / 60) * 60;

function Chip({ children, tone = 'border-line text-muted' }) {
    return <span className={`rounded-full border px-2 py-0.5 ${tone}`}>{children}</span>;
}

function MoveRow({ entry, number }) {
    const { t, tx } = useI18n();
    const clock = useClock();
    const amount = entry.seconds ? clock(entry.seconds) : t('training.dose.reps', { n: entry.reps });
    const single = entry.perSide ? t('training.dose.side', { dose: amount }) : amount;
    const dose = entry.sets > 1 ? t('training.dose.sets', { sets: entry.sets, dose: single }) : single;
    return (
        <li className={`rounded-lg border px-3 py-2 ${entry.prep ? 'border-dashed border-line/70' : 'border-line/70 bg-ink-950/30'}`}>
            <p className={`font-medium ${entry.prep ? 'text-muted' : 'text-white'}`}>
                {number && <span className="mr-1.5 font-mono text-brand-300">{number}.</span>}
                {tx(entry.name)}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                <Chip tone="border-brand-500/40 bg-brand-500/10 text-brand-200">{dose}</Chip>
                {entry.sets > 1 && entry.rest > 0 && <Chip>{t('training.restSets', { t: clock(entry.rest) })}</Chip>}
                {entry.next > 0 && <Chip>{t('training.restNext', { t: clock(entry.next) })}</Chip>}
                {(entry.sets > 1 || !entry.seconds) && <Chip tone="border-transparent font-mono text-faint">{t('training.moveTime', { t: clock(moveSeconds(entry)) })}</Chip>}
            </div>
            {entry.cue && <p className="mt-1.5 text-xs leading-relaxed text-muted">{tx(entry.cue)}</p>}
        </li>
    );
}

function OptionCard({ option, rainy, kg }) {
    const { t, tx } = useI18n();
    const clock = useClock();
    const judged = option.weather && rainy != null;
    const fits = judged && (option.weather === 'rain') === rainy;
    const stats = optionStats(option, kg);
    let number = 0;
    return (
        <div className={`rounded-lg border p-3 transition ${fits ? 'border-brand-500/50 bg-brand-500/10' : 'border-line bg-ink-900/40'} ${judged && !fits ? 'opacity-55' : ''}`}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <p className="font-medium text-white">{tx(option.label)}</p>
                {option.weather && <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">{t(`training.when.${option.weather}`)}</span>}
                {fits && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-ink-950">{t('training.fits')}</span>}
            </div>
            <div className="mb-3 flex flex-wrap gap-1.5 font-mono text-xs">
                {stats.moves > 1 && <Chip>{t('training.stat.moves', { n: stats.moves })}</Chip>}
                {stats.moves > 1 && <Chip>{t('training.stat.sets', { n: stats.sets })}</Chip>}
                <Chip>
                    {stats.rest > 0
                        ? t('training.stat.split', { total: clock(toMinutes(stats.seconds)), active: clock(toMinutes(stats.active)), rest: clock(toMinutes(stats.rest)) })
                        : t('training.stat.total', { total: clock(toMinutes(stats.seconds)) })}
                </Chip>
                <Chip tone="border-brand-500/40 text-brand-300">{t('training.burn', { n: stats.kcal })}</Chip>
            </div>
            <div className="space-y-3">
                {option.parts.map((part) => (
                    <div key={part.moves[0].name.en}>
                        {part.rounds > 1 && (
                            <p className="mb-1.5 text-xs font-semibold text-sky-200">
                                {t('training.rounds', { n: part.rounds, t: clock(part.restRound), round: clock(roundSeconds(part.moves)) })}
                            </p>
                        )}
                        <ol className="space-y-1.5 text-sm">
                            {part.moves.map((entry) => {
                                number += entry.prep ? 0 : 1;
                                return <MoveRow key={entry.name.en} entry={entry} number={entry.prep ? null : number} />;
                            })}
                        </ol>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PlanItem({ task, rainy, kg }) {
    const { tx } = useI18n();
    return (
        <div className="rounded-xl border border-line bg-ink-900/50 p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-display text-base font-semibold">{tx(task.title)}</h3>
                <span className="font-mono text-xs text-muted">{task.start}–{endTime(task.start, task.minutes)} · {formatDuration(task.minutes)}</span>
            </div>
            {task.details && <p className="mt-1 text-sm text-muted">{tx(task.details)}</p>}
            <div className={`mt-3 grid gap-3 ${task.options.length > 1 ? 'lg:grid-cols-2' : ''}`}>
                {task.options.map((option) => <OptionCard key={option.id} option={option} rainy={rainy} kg={kg} />)}
            </div>
        </div>
    );
}

function dayKcal(plan, rainy, kg) {
    return plan.reduce((sum, task) => {
        const fitting = task.options.filter((item) => !item.weather || rainy == null || (item.weather === 'rain') === rainy);
        return sum + Math.min(...fitting.map((item) => optionStats(item, kg).kcal));
    }, 0);
}

function DayCard({ dateKey, weather, record, today, index, kg }) {
    const { t } = useI18n();
    const plan = TRAINING_DAYS[dateKey].tasks;
    const target = plan.reduce((sum, task) => sum + task.minutes, 0);
    const done = sessionsMinutes(record?.sessions);
    const rainy = weather ? isRainy(weather) : null;
    const hasOutdoor = plan.some((task) => task.options.some((item) => item.weather));
    const isToday = dateKey === today;

    return (
        <motion.section
            id={`day-${dateKey}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
            className={`card scroll-mt-24 space-y-4 p-5 sm:p-6 ${isToday ? 'border-brand-500/60' : ''}`}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
                    {formatLongDate(dateKey, t)}
                    {isToday && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-ink-950">{t('training.today')}</span>}
                </h2>
                <p className="font-mono text-xs text-muted">
                    <span className={done >= target ? 'text-brand-300' : done > 0 ? 'text-amber-300' : ''}>{formatDuration(done)}</span> / {formatDuration(target)}
                    <span className="ml-2 text-brand-300">{t('training.dayBurn', { n: dayKcal(plan, rainy, kg) })}</span>
                </p>
            </div>
            {weather ? <WeatherLine day={weather} /> : <p className="text-sm text-faint">{t('training.noForecast')}</p>}
            {hasOutdoor && <p className="text-sm text-muted">{rainy == null ? t('training.pickLater') : rainy ? t('training.goIndoor') : t('training.goOutdoor')}</p>}
            <div className="space-y-3">
                {plan.map((task) => <PlanItem key={task.id} task={task} rainy={rainy} kg={kg} />)}
            </div>
        </motion.section>
    );
}

export default function TrainingPage() {
    const { t } = useI18n();
    const journal = useJournal();
    const forecast = useForecast();
    const today = todayKey();
    const keys = rangeKeys(TRAINING_FROM, TRAINING_TO);
    const kg = currentWeightKg(journal.nutrition);

    return (
        <div>
            <PageHeader eyebrow={t('training.eyebrow')} title={t('training.title')} subtitle={t('training.subtitle')} />

            <div className="mb-6 flex items-start gap-3 rounded-xl border border-line bg-ink-900/60 p-4 text-sm text-muted">
                <LuInfo className="mt-0.5 shrink-0 text-brand-400" />
                <ul className="space-y-1">
                    {t('training.rules').map((rule) => <li key={rule}>{rule}</li>)}
                    <li>{t('training.basis', { kg })}</li>
                </ul>
            </div>

            <p className="mb-3 font-mono text-xs text-faint">
                {forecast.status === 'loading' && t('training.loading')}
                {forecast.status === 'error' && t('training.error')}
                {forecast.status === 'ready' && t('training.source')}
            </p>
            <ForecastStrip keys={keys} days={forecast.days} today={today} />

            <div className="space-y-5">
                {keys.map((key, index) => (
                    <DayCard key={key} dateKey={key} weather={forecast.days[key]} record={journal.days[key]?.tasks['exercise-log']} today={today} index={index} kg={kg} />
                ))}
            </div>
        </div>
    );
}
