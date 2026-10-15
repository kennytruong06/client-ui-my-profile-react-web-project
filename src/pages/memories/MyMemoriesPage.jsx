import { useState } from 'react';
import { motion } from 'framer-motion';
import { LuPin } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import Gallery from '@/components/Gallery';
import DailyFeed from '@/components/DailyFeed';
import { useI18n } from '@/i18n/I18nProvider';

const DAILY = 'daily';
const ALBUMS = [
    'high-school-yearbook-photo',
    'high-school-normal-photo',
    'couple',
    'bf',
    'me',
    'noble-team',
    'university',
    'tom-dev-team',
    'self-defense-militia-in-vietnam',
    'my-teenage-years',
    'middle-school',
];

export default function MyMemoriesPage() {
    const { t } = useI18n();
    const [selected, setSelected] = useState(DAILY);

    return (
        <div className="mx-auto max-w-6xl">
            <PageHeader title={t('memories.title')} subtitle={t('memories.subtitle')} />
            <div className="mb-8 flex flex-wrap gap-2">
                {[DAILY, ...ALBUMS].map((folder) => (
                    <button
                        key={folder}
                        type="button"
                        onClick={() => setSelected(folder)}
                        className={`relative flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${selected === folder ? 'border-brand-500 text-ink-950' : 'border-line text-muted hover:border-line-strong hover:text-white'}`}
                    >
                        {selected === folder && <motion.span layoutId="album-pill" className="absolute inset-0 rounded-full bg-brand-500" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                        {folder === DAILY && <LuPin size={14} className="relative" />}
                        <span className="relative">{folder === DAILY ? t('memories.daily') : t(`memories.albums.${folder}`)}</span>
                    </button>
                ))}
            </div>
            <motion.div key={selected} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {selected === DAILY ? <DailyFeed /> : <Gallery folder={selected} />}
            </motion.div>
        </div>
    );
}
