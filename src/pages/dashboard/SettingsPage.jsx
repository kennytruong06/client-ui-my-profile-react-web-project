import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { LuDownload, LuTrash2, LuUpload } from 'react-icons/lu';
import PageHeader from '@/components/PageHeader';
import LanguageToggle from '@/components/LanguageToggle';
import { useI18n } from '@/i18n/I18nProvider';
import { JOURNAL_EDITABLE, importRows, journalToRows, resetJournal, setTrackingStart, useJournal } from '@/store/journalStore';
import { downloadText, fromCsv, toCsv } from '@/lib/csv';
import { todayKey } from '@/lib/date';

function Row({ title, hint, children, delay }) {
    return (
        <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
            <div>
                <h2 className="font-display font-semibold">{title}</h2>
                {hint && <p className="mt-1 max-w-md text-sm text-muted">{hint}</p>}
            </div>
            <div className="flex flex-wrap gap-2">{children}</div>
        </motion.section>
    );
}

export default function SettingsPage() {
    const { t } = useI18n();
    const journal = useJournal();
    const fileRef = useRef(null);
    const [message, setMessage] = useState(null);

    const exportCsv = () => {
        downloadText(`kenny-journal-${todayKey()}.csv`, toCsv(journalToRows(journal)));
    };

    const handleImport = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) {
            return;
        }
        try {
            const rows = fromCsv(await file.text());
            importRows(rows);
            setMessage({ ok: true, text: t('settings.imported', { n: rows.length }) });
        } catch {
            setMessage({ ok: false, text: t('settings.importFailed') });
        }
    };

    const reset = () => {
        if (window.confirm(t('settings.resetConfirm'))) {
            resetJournal();
        }
    };

    return (
        <div>
            <PageHeader title={t('settings.title')} />
            <div className="space-y-4">
                <Row title={t('settings.language')} delay={0}>
                    <LanguageToggle />
                </Row>

                <Row title={t('settings.trackingStart')} hint={t('settings.trackingStartHint')} delay={0.05}>
                    <input
                        type="date"
                        value={journal.trackingStart}
                        max={todayKey()}
                        disabled={!JOURNAL_EDITABLE}
                        onChange={(event) => event.target.value && setTrackingStart(event.target.value)}
                        className="field w-auto disabled:opacity-60"
                    />
                </Row>

                <Row title={t('settings.backup')} hint={t('settings.backupHint')} delay={0.1}>
                    <button type="button" onClick={exportCsv} className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-ink-950 transition hover:bg-brand-400">
                        <LuDownload size={16} />
                        {t('settings.exportCsv')}
                    </button>
                    {JOURNAL_EDITABLE && <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm text-muted transition hover:border-line-strong hover:text-white">
                        <LuUpload size={16} />
                        {t('settings.importCsv')}
                    </button>}
                    {JOURNAL_EDITABLE && <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleImport} className="hidden" />}
                </Row>

                {message && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-sm ${message.ok ? 'text-brand-300' : 'text-danger'}`}>
                        {message.text}
                    </motion.p>
                )}

                {JOURNAL_EDITABLE && <Row title={t('settings.reset')} delay={0.15}>
                    <button type="button" onClick={reset} className="flex items-center gap-2 rounded-xl border border-danger/40 px-4 py-2 text-sm text-danger transition hover:bg-danger/10">
                        <LuTrash2 size={16} />
                        {t('settings.reset')}
                    </button>
                </Row>}
            </div>
        </div>
    );
}
