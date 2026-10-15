import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuCheck, LuImagePlus, LuInfo, LuPencil, LuPlus, LuTrash2, LuX } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import { useI18n } from '@/i18n/I18nProvider';
import { DAILY_EDITABLE, createEntry, deleteEntry, saveCategories, updateEntry, useDaily } from '@/store/dailyStore';
import { formatShortDate, todayKey } from '@/lib/date';

function useObjectUrls(files) {
    const urls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
    useEffect(() => () => urls.forEach((url) => URL.revokeObjectURL(url)), [urls]);
    return urls;
}

function CategoryPicker({ categories, value, onChange }) {
    const toggle = (id) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);

    return (
        <div className="flex flex-wrap gap-1.5">
            {categories.map((category) => (
                <button
                    key={category.id}
                    type="button"
                    onClick={() => toggle(category.id)}
                    className={`rounded-full border px-3 py-1 text-sm transition ${value.includes(category.id) ? 'border-brand-500 bg-brand-500 font-semibold text-ink-950' : 'border-line text-muted hover:border-line-strong hover:text-white'}`}
                >
                    #{category.name}
                </button>
            ))}
        </div>
    );
}

function FileDrop({ files, onChange, disabled }) {
    const { t } = useI18n();
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);
    const previews = useObjectUrls(files);

    const addFiles = (list) => onChange([...files, ...Array.from(list).filter((file) => file.type.startsWith('image/'))]);

    return (
        <div>
            <button
                type="button"
                disabled={disabled}
                onClick={() => inputRef.current?.click()}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    addFiles(event.dataTransfer.files);
                }}
                className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-sm transition ${dragging ? 'border-brand-500 bg-brand-500/10 text-white' : 'border-line text-muted hover:border-brand-500/50 hover:text-white'}`}
            >
                <LuImagePlus size={26} className="text-brand-400" />
                {t('daily.dropHint')}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => {
                    addFiles(event.target.files);
                    event.target.value = '';
                }}
            />
            {files.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {previews.map((url, index) => (
                        <motion.div key={url} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="relative aspect-square overflow-hidden rounded-lg border border-line">
                            <img src={url} alt="" className="h-full w-full object-cover" />
                            <button
                                type="button"
                                aria-label="Remove"
                                onClick={() => onChange(files.filter((_, fileIndex) => fileIndex !== index))}
                                className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/70 text-white hover:bg-danger"
                            >
                                <LuX size={12} />
                            </button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

function EntryForm({ categories, entry, onDone }) {
    const { t } = useI18n();
    const [date, setDate] = useState(entry?.date ?? todayKey());
    const [note, setNote] = useState(entry?.note ?? '');
    const [selected, setSelected] = useState(entry?.categories ?? []);
    const [files, setFiles] = useState([]);
    const [removed, setRemoved] = useState([]);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);

    const keptImages = (entry?.images ?? []).filter((image) => !removed.includes(image));
    const canSubmit = DAILY_EDITABLE && !busy && date && keptImages.length + files.length > 0;

    const submit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            if (entry) {
                await updateEntry(entry.id, { date, note, categories: selected, addFiles: files, removeImages: removed });
            } else {
                await createEntry({ date, note, categories: selected, files });
                setNote('');
                setSelected([]);
                setFiles([]);
            }
            onDone?.();
        } catch (caught) {
            setError(caught.message);
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
                <label className="block">
                    <span className="mb-1.5 block text-sm text-muted">{t('daily.date')}</span>
                    <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="field" required />
                </label>
                <label className="block">
                    <span className="mb-1.5 block text-sm text-muted">{t('daily.note')}</span>
                    <textarea rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder={t('daily.notePlaceholder')} className="field" />
                </label>
            </div>
            <div>
                <span className="mb-1.5 block text-sm text-muted">{t('daily.categories')}</span>
                <CategoryPicker categories={categories} value={selected} onChange={setSelected} />
            </div>
            {entry && entry.images.length > 0 && (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                    {entry.images.map((image) => {
                        const isRemoved = removed.includes(image);
                        return (
                            <button
                                key={image}
                                type="button"
                                onClick={() => setRemoved(isRemoved ? removed.filter((item) => item !== image) : [...removed, image])}
                                className={`relative aspect-square overflow-hidden rounded-lg border transition ${isRemoved ? 'border-danger opacity-40' : 'border-line'}`}
                                title={t('daily.toggleRemove')}
                            >
                                <img src={image} alt="" className="h-full w-full object-cover" />
                                <span className={`absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full ${isRemoved ? 'bg-danger text-white' : 'bg-black/70 text-white'}`}>
                                    <LuTrash2 size={12} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
            <FileDrop files={files} onChange={setFiles} disabled={!DAILY_EDITABLE} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <div className="flex gap-2">
                <button type="submit" disabled={!canSubmit} className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400 disabled:opacity-40">
                    {busy ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950 border-t-transparent" /> : <LuCheck size={16} />}
                    {entry ? t('common.save') : t('daily.post')}
                </button>
                {entry && (
                    <button type="button" onClick={onDone} className="rounded-xl border border-line px-4 py-2.5 text-sm text-muted hover:text-white">
                        {t('common.cancel')}
                    </button>
                )}
            </div>
        </form>
    );
}

function CategoryManager({ categories }) {
    const { t } = useI18n();
    const [draft, setDraft] = useState('');
    const [editing, setEditing] = useState(null);
    const [error, setError] = useState(null);

    const persist = async (next) => {
        setError(null);
        try {
            await saveCategories(next);
        } catch (caught) {
            setError(caught.message);
        }
    };

    const add = async (event) => {
        event.preventDefault();
        const name = draft.trim();
        if (!name) {
            return;
        }
        await persist([...categories, { id: '', name }]);
        setDraft('');
    };

    const rename = async (event) => {
        event.preventDefault();
        if (editing.name.trim()) {
            await persist(categories.map((category) => (category.id === editing.id ? { ...category, name: editing.name.trim() } : category)));
        }
        setEditing(null);
    };

    const remove = (category) => {
        if (window.confirm(t('daily.deleteCategoryConfirm', { name: category.name }))) {
            persist(categories.filter((item) => item.id !== category.id));
        }
    };

    return (
        <div>
            <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                    editing?.id === category.id ? (
                        <form key={category.id} onSubmit={rename} className="flex items-center gap-1">
                            <input autoFocus value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="field w-36 py-1" />
                            <button type="submit" aria-label="Save" className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-ink-950"><LuCheck size={14} /></button>
                            <button type="button" aria-label="Cancel" onClick={() => setEditing(null)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted"><LuX size={14} /></button>
                        </form>
                    ) : (
                        <span key={category.id} className="group flex items-center gap-1 rounded-full border border-line py-1 pl-3 pr-1 text-sm">
                            #{category.name}
                            <button type="button" disabled={!DAILY_EDITABLE} aria-label="Rename" onClick={() => setEditing({ id: category.id, name: category.name })} className="grid h-6 w-6 place-items-center rounded-full text-faint hover:bg-white/10 hover:text-white disabled:hidden">
                                <LuPencil size={12} />
                            </button>
                            <button type="button" disabled={!DAILY_EDITABLE} aria-label="Delete" onClick={() => remove(category)} className="grid h-6 w-6 place-items-center rounded-full text-faint hover:bg-danger/20 hover:text-danger disabled:hidden">
                                <LuTrash2 size={12} />
                            </button>
                        </span>
                    )
                ))}
            </div>
            {DAILY_EDITABLE && (
                <form onSubmit={add} className="mt-3 flex max-w-sm gap-2">
                    <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t('daily.newCategory')} className="field" />
                    <button type="submit" className="flex shrink-0 items-center gap-1 rounded-xl bg-brand-500 px-3 text-sm font-semibold text-ink-950"><LuPlus size={16} />{t('daily.add')}</button>
                </form>
            )}
            {error && <p className="mt-2 text-sm text-danger">{error}</p>}
        </div>
    );
}

export default function DailyPage() {
    const { t } = useI18n();
    const { entries, categories } = useDaily();
    const [editingId, setEditingId] = useState(null);

    const remove = async (entry) => {
        if (window.confirm(t('daily.deleteEntryConfirm', { date: formatShortDate(entry.date, t) }))) {
            await deleteEntry(entry.id);
        }
    };

    return (
        <div>
            <PageHeader title={t('daily.title')} subtitle={t('daily.subtitle')} />

            {!DAILY_EDITABLE && (
                <p className="mb-6 flex items-start gap-3 rounded-xl border border-line bg-ink-900/60 p-4 text-sm text-muted">
                    <LuInfo className="mt-0.5 shrink-0 text-brand-400" />
                    {t('daily.readOnly')}
                </p>
            )}

            <div className="space-y-4">
                <section className="card p-5 sm:p-6">
                    <h2 className="mb-4 font-display text-lg font-semibold">{t('daily.newEntry')}</h2>
                    <EntryForm categories={categories} />
                </section>

                <section className="card p-5 sm:p-6">
                    <h2 className="mb-4 font-display text-lg font-semibold">{t('daily.manageCategories')}</h2>
                    <CategoryManager categories={categories} />
                </section>

                <section>
                    <h2 className="mb-4 mt-8 font-display text-lg font-semibold">{t('daily.posted', { n: entries.length })}</h2>
                    <div className="space-y-3">
                        <AnimatePresence initial={false}>
                            {entries.map((entry) => (
                                <motion.article key={entry.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -30 }} className="card p-4 sm:p-5">
                                    {editingId === entry.id ? (
                                        <EntryForm categories={categories} entry={entry} onDone={() => setEditingId(null)} />
                                    ) : (
                                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                                            <div className="flex shrink-0 -space-x-6">
                                                {entry.images.slice(0, 3).map((image) => (
                                                    <img key={image} src={image} alt="" className="h-16 w-16 rounded-lg border-2 border-ink-900 object-cover" />
                                                ))}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-display font-semibold">{formatShortDate(entry.date, t)} <span className="font-mono text-xs font-normal text-faint">· {entry.images.length} {t('daily.photos')}</span></p>
                                                {entry.note && <p className="mt-1 line-clamp-2 text-sm text-muted">{entry.note}</p>}
                                                <div className="mt-2 flex flex-wrap gap-1">
                                                    {entry.categories.map((id) => (
                                                        <span key={id} className="rounded-full bg-brand-500/10 px-2 py-0.5 text-xs text-brand-300">#{categories.find((category) => category.id === id)?.name}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            {DAILY_EDITABLE && (
                                                <div className="flex gap-1">
                                                    <button type="button" aria-label="Edit" onClick={() => setEditingId(entry.id)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:text-white"><LuPencil size={14} /></button>
                                                    <button type="button" aria-label="Delete" onClick={() => remove(entry)} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-danger/50 hover:text-danger"><LuTrash2 size={14} /></button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>
                </section>
            </div>
        </div>
    );
}
