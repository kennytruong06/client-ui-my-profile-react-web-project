import { LuVolume2 } from 'react-icons/lu';
import { useI18n } from '@/i18n/I18nProvider';
import { splitLines, splitList } from '@/data/english';
import { canSpeak, speak } from '@/lib/speech';

export function PosBadge({ pos }) {
    const { t } = useI18n();
    if (!pos) {
        return null;
    }
    return <span className="rounded-md bg-white/10 px-2 py-0.5 font-mono text-xs text-muted">{t(`english.pos.${pos}`)}</span>;
}

export function SpeakButton({ text, size = 16 }) {
    if (!canSpeak()) {
        return null;
    }
    return (
        <button
            type="button"
            aria-label="Pronounce"
            onClick={(event) => {
                event.stopPropagation();
                speak(text);
            }}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-brand-400 transition hover:bg-brand-500/15"
        >
            <LuVolume2 size={size} />
        </button>
    );
}

function ChipRow({ label, items, tone }) {
    if (items.length === 0) {
        return null;
    }
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-faint">{label}</span>
            {items.map((item) => (
                <span key={item} className={`rounded-full px-2.5 py-0.5 text-xs ${tone}`}>{item}</span>
            ))}
        </div>
    );
}

export default function WordDetails({ word, topics, showHeader = true }) {
    const { t } = useI18n();
    const examples = splitLines(word.examples);
    const topicNames = (word.topics ?? []).map((id) => topics.find((topic) => topic.id === id)?.name).filter(Boolean);

    return (
        <div className="space-y-3">
            {showHeader && (
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display text-2xl font-semibold text-white">{word.word}</h3>
                    <SpeakButton text={word.word} />
                    {word.ipa && <span className="font-mono text-sm text-muted">{word.ipa}</span>}
                    <PosBadge pos={word.pos} />
                </div>
            )}
            {word.meaning && <p className="text-lg text-brand-300">{word.meaning}</p>}
            <ChipRow label={t('english.vocab.synonyms')} items={splitList(word.synonyms)} tone="bg-brand-500/10 text-brand-300" />
            <ChipRow label={t('english.vocab.antonyms')} items={splitList(word.antonyms)} tone="bg-danger/10 text-danger" />
            {examples.length > 0 && (
                <ul className="space-y-1.5 border-l-2 border-brand-500/40 pl-3">
                    {examples.map((example) => <li key={example} className="text-sm italic text-muted">“{example}”</li>)}
                </ul>
            )}
            {topicNames.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {topicNames.map((name) => <span key={name} className="text-xs text-faint">#{name}</span>)}
                </div>
            )}
        </div>
    );
}
