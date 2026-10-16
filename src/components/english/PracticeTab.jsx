import { useMemo, useState } from 'react';
import { AnimatePresence, motion, useAnimationControls } from 'framer-motion';
import { LuBrain, LuCheck, LuDices, LuLayers, LuNotebookPen, LuPuzzle, LuRotateCcw, LuRotateCw, LuShuffle, LuThumbsUp } from 'react-icons/lu';
import WordDetails, { PosBadge, SpeakButton } from '@/components/english/WordDetails';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, addExample, recordReview, useJournal } from '@/store/journalStore';
import { splitList } from '@/data/english';
import { shuffle } from '@/lib/speech';

const MODES = [
    { id: 'flashcards', icon: LuLayers, min: 1 },
    { id: 'match', icon: LuPuzzle, min: 2 },
    { id: 'quiz', icon: LuBrain, min: 4 },
    { id: 'write', icon: LuNotebookPen, min: 1 },
];
const MATCH_SIZE = 6;

function NeedMore({ count }) {
    const { t } = useI18n();
    return <p className="card p-10 text-center text-muted">{t('english.practice.needMore', { n: count })}</p>;
}

function ReviewButtons({ onAnswer }) {
    const { t } = useI18n();
    return (
        <div className="flex justify-center gap-3">
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => onAnswer(false)} className="flex items-center gap-2 rounded-xl border border-line px-5 py-2.5 text-sm text-muted transition hover:border-danger/50 hover:text-white">
                <LuRotateCcw size={16} />
                {t('english.practice.again')}
            </motion.button>
            <motion.button type="button" whileTap={{ scale: 0.94 }} onClick={() => onAnswer(true)} className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                <LuThumbsUp size={16} />
                {t('english.practice.gotIt')}
            </motion.button>
        </div>
    );
}

function Flashcards({ words, topics }) {
    const { t } = useI18n();
    const [deck, setDeck] = useState(() => shuffle(words));
    const [position, setPosition] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [score, setScore] = useState({ good: 0, again: 0 });
    const finished = position >= deck.length;
    const card = deck[position];

    const answer = (remembered) => {
        recordReview(card.id, remembered);
        setScore((current) => ({ ...current, [remembered ? 'good' : 'again']: current[remembered ? 'good' : 'again'] + 1 }));
        setFlipped(false);
        setPosition(position + 1);
    };

    const restart = () => {
        setDeck(shuffle(words));
        setPosition(0);
        setFlipped(false);
        setScore({ good: 0, again: 0 });
    };

    if (finished) {
        return (
            <div className="card p-10 text-center">
                <p className="font-display text-2xl font-semibold">{t('english.practice.deckDone')}</p>
                <p className="mt-2 font-mono text-muted">✓ {score.good} · ↺ {score.again}</p>
                <button type="button" onClick={restart} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-950"><LuShuffle size={16} />{t('english.practice.playAgain')}</button>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-xl">
            <div className="mb-3 flex items-center justify-between font-mono text-xs text-faint">
                <span>{position + 1}/{deck.length}</span>
                <span>✓ {score.good} · ↺ {score.again}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-ink-800">
                <motion.div className="h-full bg-brand-500" animate={{ width: `${(position / deck.length) * 100}%` }} />
            </div>
            <div className="mt-6 [perspective:1400px]">
                <motion.div
                    role="button"
                    tabIndex={0}
                    onClick={() => setFlipped((value) => !value)}
                    onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && setFlipped((value) => !value)}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                    className="relative block min-h-72 w-full cursor-pointer text-left [transform-style:preserve-3d]"
                >
                    <div className="card absolute inset-0 flex flex-col items-center justify-center gap-3 border-brand-500/30 p-8 [backface-visibility:hidden]">
                        <p className="font-display text-4xl font-semibold">{card.word}</p>
                        <div className="flex items-center gap-2">
                            {card.ipa && <span className="font-mono text-muted">{card.ipa}</span>}
                            <PosBadge pos={card.pos} />
                            <SpeakButton text={card.word} />
                        </div>
                        <p className="mt-4 flex items-center gap-1.5 text-xs text-faint"><LuRotateCw size={12} />{t('english.practice.tapToFlip')}</p>
                    </div>
                    <div className="card absolute inset-0 overflow-y-auto bg-ink-900 p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                        <WordDetails word={card} topics={topics} />
                    </div>
                </motion.div>
            </div>
            <div className="mt-6">
                <ReviewButtons onAnswer={answer} />
            </div>
        </div>
    );
}

function buildMatchRound(words, kind) {
    const candidates = shuffle(words.filter((word) => (kind === 'meaning' ? word.meaning : splitList(word[kind]).length > 0))).slice(0, MATCH_SIZE);
    const pairs = candidates.map((word) => ({ id: word.id, left: word.word, right: kind === 'meaning' ? word.meaning : shuffle(splitList(word[kind]))[0] }));
    return { pairs, rights: shuffle(pairs) };
}

function MatchGame({ words }) {
    const { t } = useI18n();
    const [kind, setKind] = useState('synonyms');
    const [round, setRound] = useState(() => buildMatchRound(words, 'synonyms'));
    const [picked, setPicked] = useState(null);
    const [solved, setSolved] = useState([]);
    const [mistakes, setMistakes] = useState(0);
    const [wrong, setWrong] = useState(null);
    const controls = useAnimationControls();

    const reset = (nextKind = kind) => {
        setKind(nextKind);
        setRound(buildMatchRound(words, nextKind));
        setPicked(null);
        setSolved([]);
        setMistakes(0);
    };

    const chooseRight = async (pair) => {
        if (!picked || solved.includes(pair.id)) {
            return;
        }
        if (picked === pair.id) {
            setSolved([...solved, pair.id]);
            setPicked(null);
            return;
        }
        setMistakes(mistakes + 1);
        setWrong(pair.id);
        await controls.start({ x: [0, -8, 8, -4, 0], transition: { duration: 0.3 } });
        setWrong(null);
        setPicked(null);
    };

    const done = round.pairs.length > 0 && solved.length === round.pairs.length;
    const cell = (active, isSolved, isWrong) => `w-full rounded-xl border px-4 py-3 text-left text-sm transition ${isSolved ? 'border-brand-500/40 bg-brand-500/15 text-brand-300' : isWrong ? 'border-danger bg-danger/10 text-white' : active ? 'border-brand-400 bg-brand-500/10 text-white' : 'border-line text-white hover:border-line-strong'}`;

    return (
        <div>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-1 rounded-xl border border-line bg-ink-900 p-1">
                    {['synonyms', 'antonyms', 'meaning'].map((option) => (
                        <button key={option} type="button" onClick={() => reset(option)} className={`rounded-lg px-3 py-1.5 text-sm transition ${kind === option ? 'bg-brand-500 font-semibold text-ink-950' : 'text-muted hover:text-white'}`}>
                            {t(`english.practice.matchBy.${option}`)}
                        </button>
                    ))}
                </div>
                <span className="font-mono text-xs text-faint">{solved.length}/{round.pairs.length} · ✕ {mistakes}</span>
            </div>

            {round.pairs.length < 2 ? (
                <p className="card p-8 text-center text-muted">{t('english.practice.matchEmpty')}</p>
            ) : done ? (
                <div className="card p-10 text-center">
                    <p className="font-display text-2xl font-semibold">{t('english.practice.matchDone')}</p>
                    <p className="mt-2 font-mono text-muted">✕ {mistakes}</p>
                    <button type="button" onClick={() => reset()} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-950"><LuShuffle size={16} />{t('english.practice.playAgain')}</button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    <div className="space-y-2">
                        {round.pairs.map((pair) => (
                            <motion.button key={pair.id} type="button" layout whileTap={{ scale: 0.97 }} disabled={solved.includes(pair.id)} onClick={() => setPicked(pair.id)} className={cell(picked === pair.id, solved.includes(pair.id), false)}>
                                <span className="font-semibold">{pair.left}</span>
                            </motion.button>
                        ))}
                    </div>
                    <motion.div animate={controls} className="space-y-2">
                        {round.rights.map((pair) => (
                            <motion.button key={pair.id} type="button" layout whileTap={{ scale: 0.97 }} disabled={solved.includes(pair.id)} onClick={() => chooseRight(pair)} className={cell(false, solved.includes(pair.id), wrong === pair.id)}>
                                {pair.right}
                            </motion.button>
                        ))}
                    </motion.div>
                </div>
            )}
        </div>
    );
}

function buildQuestion(words) {
    const answer = words[Math.floor(Math.random() * words.length)];
    const distractors = shuffle(words.filter((word) => word.id !== answer.id)).slice(0, 3);
    return { answer, options: shuffle([answer, ...distractors]) };
}

function Quiz({ words }) {
    const { t } = useI18n();
    const pool = useMemo(() => words.filter((word) => word.meaning), [words]);
    const [question, setQuestion] = useState(() => (pool.length >= 4 ? buildQuestion(pool) : null));
    const [chosen, setChosen] = useState(null);
    const [stats, setStats] = useState({ right: 0, total: 0, streak: 0 });

    if (!question) {
        return <NeedMore count={4} />;
    }

    const choose = (option) => {
        if (chosen) {
            return;
        }
        const correct = option.id === question.answer.id;
        setChosen(option.id);
        recordReview(question.answer.id, correct);
        setStats((current) => ({ right: current.right + Number(correct), total: current.total + 1, streak: correct ? current.streak + 1 : 0 }));
    };

    const next = () => {
        setChosen(null);
        setQuestion(buildQuestion(pool));
    };

    return (
        <div className="mx-auto max-w-xl">
            <div className="mb-4 flex justify-between font-mono text-xs text-faint">
                <span>{stats.right}/{stats.total}</span>
                <span>🔥 {stats.streak}</span>
            </div>
            <AnimatePresence mode="wait">
                <motion.div key={question.answer.id + stats.total} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="card p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-faint">{t('english.practice.whichWord')}</p>
                    <p className="mt-2 font-display text-2xl font-semibold text-brand-300">{question.answer.meaning}</p>
                    <div className="mt-6 grid gap-2 sm:grid-cols-2">
                        {question.options.map((option) => {
                            const isAnswer = option.id === question.answer.id;
                            const state = !chosen ? 'border-line hover:border-brand-500/50' : isAnswer ? 'border-brand-500 bg-brand-500/15 text-brand-300' : chosen === option.id ? 'border-danger bg-danger/10' : 'border-line opacity-40';
                            return (
                                <motion.button key={option.id} type="button" whileTap={{ scale: 0.97 }} onClick={() => choose(option)} className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${state}`}>
                                    {option.word}
                                </motion.button>
                            );
                        })}
                    </div>
                    {chosen && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center justify-between gap-3">
                            <span className="flex items-center gap-2 text-sm text-muted">
                                <SpeakButton text={question.answer.word} />
                                {question.answer.word} {question.answer.ipa}
                            </span>
                            <button type="button" onClick={next} className="rounded-xl bg-brand-500 px-5 py-2 text-sm font-semibold text-ink-950">{t('english.practice.next')}</button>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

function WriteReveal({ words, topics }) {
    const { t } = useI18n();
    const [word, setWord] = useState(() => words[Math.floor(Math.random() * words.length)]);
    const [attempt, setAttempt] = useState('');
    const [revealed, setRevealed] = useState(false);
    const [saved, setSaved] = useState(false);

    const next = () => {
        const others = words.length > 1 ? words.filter((item) => item.id !== word.id) : words;
        setWord(others[Math.floor(Math.random() * others.length)]);
        setAttempt('');
        setRevealed(false);
        setSaved(false);
    };

    const answer = (remembered) => {
        recordReview(word.id, remembered);
        next();
    };

    return (
        <div className="mx-auto max-w-3xl">
            <AnimatePresence mode="wait">
                <motion.div key={word.id + String(revealed)} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="card p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="font-display text-4xl font-semibold">{word.word}</p>
                            <SpeakButton text={word.word} size={18} />
                            <PosBadge pos={word.pos} />
                        </div>
                        <button type="button" onClick={next} className="flex items-center gap-2 rounded-xl border border-line px-3 py-1.5 text-sm text-muted hover:text-white"><LuDices size={16} />{t('english.practice.random')}</button>
                    </div>

                    <label className="mt-6 block">
                        <span className="mb-1.5 block text-sm text-muted">{t('english.practice.yourNote')}</span>
                        <textarea rows={4} value={attempt} onChange={(event) => setAttempt(event.target.value)} readOnly={revealed} placeholder={t('english.practice.yourNotePlaceholder')} className="field" />
                    </label>

                    {!revealed ? (
                        <button type="button" onClick={() => setRevealed(true)} className="mt-4 flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                            <LuCheck size={16} />
                            {t('english.practice.check')}
                        </button>
                    ) : (
                        <motion.div initial={{ opacity: 0, rotateX: -20 }} animate={{ opacity: 1, rotateX: 0 }} className="mt-6 space-y-5">
                            <div className="rounded-xl border border-brand-500/30 bg-brand-500/5 p-5">
                                <WordDetails word={word} topics={topics} showHeader={false} />
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                {JOURNAL_EDITABLE && attempt.trim() ? (
                                    <button
                                        type="button"
                                        disabled={saved}
                                        onClick={() => {
                                            addExample(word.id, attempt.trim());
                                            setSaved(true);
                                        }}
                                        className="rounded-xl border border-line px-4 py-2 text-sm text-muted transition hover:text-white disabled:text-brand-300"
                                    >
                                        {saved ? `✓ ${t('english.practice.saved')}` : t('english.practice.saveExample')}
                                    </button>
                                ) : <span />}
                                <ReviewButtons onAnswer={answer} />
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}

export default function PracticeTab() {
    const { t } = useI18n();
    const { vocab } = useJournal();
    const [mode, setMode] = useState('flashcards');
    const [topicFilter, setTopicFilter] = useState([]);
    const [session, setSession] = useState(0);

    const pool = vocab.words.filter((word) => topicFilter.length === 0 || (word.topics ?? []).some((id) => topicFilter.includes(id)));
    const current = MODES.find((item) => item.id === mode);
    const toggleTopic = (id) => {
        setTopicFilter((list) => (list.includes(id) ? list.filter((item) => item !== id) : [...list, id]));
        setSession((value) => value + 1);
    };

    return (
        <div>
            <div className="mb-5 grid grid-cols-2 gap-2 md:grid-cols-4">
                {MODES.map(({ id, icon: Icon }) => (
                    <motion.button
                        key={id}
                        type="button"
                        whileHover={{ y: -3 }}
                        onClick={() => {
                            setMode(id);
                            setSession((value) => value + 1);
                        }}
                        className={`card flex flex-col items-start gap-2 p-4 text-left transition-colors ${mode === id ? 'border-brand-500/60 bg-brand-500/10' : 'hover:border-line-strong'}`}
                    >
                        <Icon size={20} className="text-brand-400" />
                        <span className="font-display font-semibold">{t(`english.practice.modes.${id}`)}</span>
                        <span className="text-xs text-muted">{t(`english.practice.modeHints.${id}`)}</span>
                    </motion.button>
                ))}
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-faint">{t('english.vocab.topics')}</span>
                {vocab.topics.map((topic) => (
                    <button
                        key={topic.id}
                        type="button"
                        onClick={() => toggleTopic(topic.id)}
                        className={`rounded-full border px-3 py-1 text-xs transition ${topicFilter.includes(topic.id) ? 'border-brand-500 bg-brand-500 font-semibold text-ink-950' : 'border-line text-muted hover:text-white'}`}
                    >
                        #{topic.name}
                    </button>
                ))}
                <span className="ml-auto font-mono text-xs text-faint">{t('english.practice.pool', { n: pool.length })}</span>
            </div>

            {pool.length < current.min ? (
                <NeedMore count={current.min} />
            ) : (
                <div key={`${mode}-${session}`}>
                    {mode === 'flashcards' && <Flashcards words={pool} topics={vocab.topics} />}
                    {mode === 'match' && <MatchGame words={pool} />}
                    {mode === 'quiz' && <Quiz words={pool} />}
                    {mode === 'write' && <WriteReveal words={pool} topics={vocab.topics} />}
                </div>
            )}
        </div>
    );
}
