import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuCalendarDays } from 'react-icons/lu';
import Lightbox from '@/components/Lightbox';
import { useI18n } from '@/i18n/I18nProvider';
import { useDaily } from '@/store/dailyStore';
import { formatShortDate } from '@/lib/date';

function gridClass(count) {
    if (count === 1) {
        return 'grid-cols-1';
    }
    if (count === 2 || count === 4) {
        return 'grid-cols-2';
    }
    return 'grid-cols-2 sm:grid-cols-3';
}

export default function DailyFeed() {
    const { t } = useI18n();
    const { entries, categories } = useDaily();
    const [filters, setFilters] = useState([]);
    const [viewer, setViewer] = useState(null);

    const nameOf = (id) => categories.find((category) => category.id === id)?.name ?? id;
    const visible = filters.length ? entries.filter((entry) => entry.categories.some((id) => filters.includes(id))) : entries;
    const toggle = (id) => setFilters((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));

    return (
        <div>
            <div className="mb-8 flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setFilters([])}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition ${filters.length === 0 ? 'border-white bg-white font-semibold text-ink-950' : 'border-line text-muted hover:text-white'}`}
                >
                    {t('memories.allCategories')}
                </button>
                {categories.map((category) => (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => toggle(category.id)}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition ${filters.includes(category.id) ? 'border-brand-500 bg-brand-500/15 font-semibold text-brand-300' : 'border-line text-muted hover:border-line-strong hover:text-white'}`}
                    >
                        #{category.name}
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <p className="card p-10 text-center text-muted">{t('memories.dailyEmpty')}</p>
            ) : (
                <ol className="relative ml-3 border-l border-dashed border-line-strong sm:ml-4">
                    {visible.map((entry, entryIndex) => (
                        <motion.li
                            key={entry.id}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-60px' }}
                            transition={{ duration: 0.45, delay: Math.min(entryIndex, 3) * 0.05 }}
                            className="relative pb-14 pl-7 last:pb-2 sm:pl-10"
                        >
                            <span className="absolute -left-[9px] top-1 grid h-[18px] w-[18px] place-items-center rounded-full bg-ink-950 ring-2 ring-brand-500">
                                <span className="h-2 w-2 rounded-full bg-brand-500" />
                            </span>
                            <p className="flex items-center gap-2 font-display text-xl font-semibold text-white">
                                <LuCalendarDays className="text-brand-400" size={18} />
                                {formatShortDate(entry.date, t)}
                            </p>
                            {entry.note && <p className="mt-2 max-w-2xl whitespace-pre-line text-muted">{entry.note}</p>}
                            {entry.categories.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-1.5">
                                    {entry.categories.map((id) => (
                                        <span key={id} className="rounded-full bg-brand-500/10 px-2.5 py-0.5 text-xs text-brand-300">#{nameOf(id)}</span>
                                    ))}
                                </div>
                            )}
                            <div className={`mt-4 grid max-w-3xl gap-2 ${gridClass(entry.images.length)}`}>
                                {entry.images.map((image, index) => (
                                    <button
                                        key={image}
                                        type="button"
                                        onClick={() => setViewer({ entry, index })}
                                        className={`group overflow-hidden rounded-xl border border-line ${entry.images.length === 1 ? 'max-h-[520px]' : 'aspect-square'}`}
                                    >
                                        <img src={image} alt={entry.note} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                                    </button>
                                ))}
                            </div>
                        </motion.li>
                    ))}
                </ol>
            )}

            <Lightbox
                images={viewer?.entry.images ?? []}
                index={viewer?.index ?? null}
                caption={viewer ? `${formatShortDate(viewer.entry.date, t)}${viewer.entry.note ? ` · ${viewer.entry.note}` : ''}` : ''}
                onChange={(index) => setViewer((current) => ({ ...current, index }))}
                onClose={() => setViewer(null)}
            />
        </div>
    );
}
