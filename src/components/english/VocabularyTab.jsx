import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LuCheck, LuPencil, LuPlus, LuSearch, LuTags, LuTrash2, LuX } from 'react-icons/lu';
import WordDetails, { PosBadge, SpeakButton } from '@/components/english/WordDetails';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, deleteWord, newId, saveTopics, saveWord, useJournal } from '@/store/journalStore';
import { PARTS_OF_SPEECH, splitList } from '@/data/english';

const EMPTY_WORD = { id: '', word: '', ipa: '', pos: 'noun', meaning: '', synonyms: '', antonyms: '', examples: '', topics: [] };

function TopicChips({ topics, value, onChange }) {
    const toggle = (id) => onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
    return (
        <div className="flex flex-wrap gap-1.5">
            {topics.map((topic) => (
                <button
                    key={topic.id}
                    type="button"
                    onClick={() => toggle(topic.id)}
                    className={`rounded-full border px-3 py-1 text-xs transition ${value.includes(topic.id) ? 'border-brand-500 bg-brand-500 font-semibold text-ink-950' : 'border-line text-muted hover:border-line-strong hover:text-white'}`}
                >
                    #{topic.name}
                </button>
            ))}
        </div>
    );
}

function Field({ label, children, className = '' }) {
    return (
        <label className={`block ${className}`}>
            <span className="mb-1.5 block text-sm text-muted">{label}</span>
            {children}
        </label>
    );
}

function WordForm({ initial, topics, onClose }) {
    const { t } = useI18n();
    const [word, setWord] = useState({ ...EMPTY_WORD, ...initial });
    const set = (key) => (event) => setWord({ ...word, [key]: event.target.value });

    const submit = (event) => {
        event.preventDefault();
        if (!word.word.trim()) {
            return;
        }
        saveWord({ ...word, word: word.word.trim() });
        onClose();
    };

    return (
        <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card space-y-4 border-brand-500/30 p-5"
        >
            <div className="grid gap-3 sm:grid-cols-3">
                <Field label={`${t('english.vocab.word')} *`}>
                    <input autoFocus value={word.word} onChange={set('word')} className="field" required />
                </Field>
                <Field label={t('english.vocab.ipa')}>
                    <input value={word.ipa} onChange={set('ipa')} placeholder="/ˈæp.əl/" className="field font-mono" />
                </Field>
                <Field label={t('english.vocab.pos')}>
                    <select value={word.pos} onChange={set('pos')} className="field">
                        {PARTS_OF_SPEECH.map((pos) => <option key={pos} value={pos}>{t(`english.pos.${pos}`)}</option>)}
                    </select>
                </Field>
            </div>
            <Field label={t('english.vocab.meaning')}>
                <input value={word.meaning} onChange={set('meaning')} placeholder={t('english.vocab.meaningPlaceholder')} className="field" />
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label={t('english.vocab.synonyms')}>
                    <input value={word.synonyms} onChange={set('synonyms')} placeholder={t('english.vocab.listPlaceholder')} className="field" />
                </Field>
                <Field label={t('english.vocab.antonyms')}>
                    <input value={word.antonyms} onChange={set('antonyms')} placeholder={t('english.vocab.listPlaceholder')} className="field" />
                </Field>
            </div>
            <Field label={t('english.vocab.examples')}>
                <textarea rows={3} value={word.examples} onChange={set('examples')} placeholder={t('english.vocab.examplesPlaceholder')} className="field" />
            </Field>
            <div>
                <span className="mb-1.5 block text-sm text-muted">{t('english.vocab.topics')}</span>
                <TopicChips topics={topics} value={word.topics} onChange={(next) => setWord({ ...word, topics: next })} />
            </div>
            <div className="flex gap-2">
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                    <LuCheck size={16} />
                    {t('common.save')}
                </button>
                <button type="button" onClick={onClose} className="rounded-xl border border-line px-4 py-2 text-sm text-muted hover:text-white">{t('common.cancel')}</button>
            </div>
        </motion.form>
    );
}

function TopicManager({ topics }) {
    const { t } = useI18n();
    const [draft, setDraft] = useState('');
    const [editing, setEditing] = useState(null);

    const add = (event) => {
        event.preventDefault();
        if (draft.trim()) {
            saveTopics([...topics, { id: newId(), name: draft.trim() }]);
            setDraft('');
        }
    };

    const rename = (event) => {
        event.preventDefault();
        if (editing.name.trim()) {
            saveTopics(topics.map((topic) => (topic.id === editing.id ? { ...topic, name: editing.name.trim() } : topic)));
        }
        setEditing(null);
    };

    return (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="card mb-4 p-5">
                <div className="flex flex-wrap gap-2">
                    {topics.map((topic) => (
                        editing?.id === topic.id ? (
                            <form key={topic.id} onSubmit={rename} className="flex items-center gap-1">
                                <input autoFocus value={editing.name} onChange={(event) => setEditing({ ...editing, name: event.target.value })} className="field w-36 py-1" />
                                <button type="submit" aria-label="Save" className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500 text-ink-950"><LuCheck size={14} /></button>
                            </form>
                        ) : (
                            <span key={topic.id} className="flex items-center gap-1 rounded-full border border-line py-1 pl-3 pr-1 text-sm">
                                #{topic.name}
                                <button type="button" aria-label="Rename" onClick={() => setEditing({ ...topic })} className="grid h-6 w-6 place-items-center rounded-full text-faint hover:bg-white/10 hover:text-white"><LuPencil size={12} /></button>
                                <button
                                    type="button"
                                    aria-label="Delete"
                                    onClick={() => window.confirm(t('english.vocab.deleteTopicConfirm', { name: topic.name })) && saveTopics(topics.filter((item) => item.id !== topic.id))}
                                    className="grid h-6 w-6 place-items-center rounded-full text-faint hover:bg-danger/20 hover:text-danger"
                                >
                                    <LuTrash2 size={12} />
                                </button>
                            </span>
                        )
                    ))}
                </div>
                <form onSubmit={add} className="mt-3 flex max-w-sm gap-2">
                    <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder={t('english.vocab.newTopic')} className="field" />
                    <button type="submit" className="flex shrink-0 items-center gap-1 rounded-xl bg-brand-500 px-3 text-sm font-semibold text-ink-950"><LuPlus size={16} />{t('daily.add')}</button>
                </form>
            </div>
        </motion.div>
    );
}

function matches(word, query) {
    if (!query) {
        return true;
    }
    const haystack = [word.word, word.meaning, word.synonyms, word.antonyms, word.examples].join(' ').toLowerCase();
    return haystack.includes(query.toLowerCase());
}

export default function VocabularyTab() {
    const { t } = useI18n();
    const { vocab } = useJournal();
    const [query, setQuery] = useState('');
    const [topicFilter, setTopicFilter] = useState([]);
    const [posFilter, setPosFilter] = useState('');
    const [editing, setEditing] = useState(null);
    const [showTopics, setShowTopics] = useState(false);

    const visible = vocab.words.filter((word) => matches(word, query)
        && (!posFilter || word.pos === posFilter)
        && (topicFilter.length === 0 || (word.topics ?? []).some((id) => topicFilter.includes(id))));

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
                <div className="relative min-w-52 flex-1">
                    <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-faint" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t('english.vocab.search')} className="field pl-9" />
                </div>
                <select value={posFilter} onChange={(event) => setPosFilter(event.target.value)} className="field w-auto">
                    <option value="">{t('english.vocab.allPos')}</option>
                    {PARTS_OF_SPEECH.map((pos) => <option key={pos} value={pos}>{t(`english.pos.${pos}`)}</option>)}
                </select>
                {JOURNAL_EDITABLE && <button type="button" onClick={() => setShowTopics((value) => !value)} className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition ${showTopics ? 'border-brand-500 text-white' : 'border-line text-muted hover:text-white'}`}>
                    <LuTags size={16} />
                    {t('english.vocab.manageTopics')}
                </button>}
                {JOURNAL_EDITABLE && <button type="button" onClick={() => setEditing({})} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                    <LuPlus size={16} />
                    {t('english.vocab.add')}
                </button>}
            </div>

            <AnimatePresence>{showTopics && <TopicManager key="topics" topics={vocab.topics} />}</AnimatePresence>

            <div className="mb-6">
                <TopicChips topics={vocab.topics} value={topicFilter} onChange={setTopicFilter} />
            </div>

            <AnimatePresence>
                {editing && !editing.id && (
                    <div className="mb-6">
                        <WordForm key="new" initial={{}} topics={vocab.topics} onClose={() => setEditing(null)} />
                    </div>
                )}
            </AnimatePresence>

            <p className="mb-3 font-mono text-xs text-faint">{t('english.vocab.count', { shown: visible.length, total: vocab.words.length })}</p>

            {vocab.words.length === 0 ? (
                <p className="card p-10 text-center text-muted">{t('english.vocab.empty')}</p>
            ) : (
                <div className="grid gap-3 md:grid-cols-2">
                    <AnimatePresence initial={false}>
                        {visible.map((word) => (
                            editing?.id === word.id ? (
                                <div key={word.id} className="md:col-span-2">
                                    <WordForm initial={word} topics={vocab.topics} onClose={() => setEditing(null)} />
                                </div>
                            ) : (
                                <motion.article
                                    key={word.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.97 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="card group p-5"
                                >
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-display text-xl font-semibold">{word.word}</h3>
                                            <SpeakButton text={word.word} />
                                            {word.ipa && <span className="font-mono text-sm text-muted">{word.ipa}</span>}
                                            <PosBadge pos={word.pos} />
                                        </div>
                                        {JOURNAL_EDITABLE && <div className="flex gap-1 opacity-60 transition group-hover:opacity-100">
                                            <button type="button" aria-label="Edit" onClick={() => setEditing(word)} className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-white"><LuPencil size={13} /></button>
                                            <button
                                                type="button"
                                                aria-label="Delete"
                                                onClick={() => window.confirm(t('english.vocab.deleteConfirm', { word: word.word })) && deleteWord(word.id)}
                                                className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:border-danger/50 hover:text-danger"
                                            >
                                                <LuTrash2 size={13} />
                                            </button>
                                        </div>}
                                    </div>
                                    <WordDetails word={word} topics={vocab.topics} showHeader={false} />
                                    {word.reviews && (
                                        <p className="mt-3 font-mono text-[11px] text-faint">✓ {word.reviews.good} · ↺ {word.reviews.again}</p>
                                    )}
                                </motion.article>
                            )
                        ))}
                    </AnimatePresence>
                </div>
            )}
            {vocab.words.length > 0 && visible.length === 0 && (
                <p className="mt-4 flex items-center gap-2 text-sm text-muted"><LuX />{t('english.vocab.noMatch')}</p>
            )}
            <p className="mt-6 text-xs text-faint">{t('english.vocab.splitHint', { example: splitList('big, large; huge').join(' · ') })}</p>
        </div>
    );
}
