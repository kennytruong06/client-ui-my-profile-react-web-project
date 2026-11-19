import { useEffect, useState } from 'react';
import { useI18n } from '@/i18n/I18nProvider';

export default function AmountField({ value, unit, onCommit, disabled = false, step = 5 }) {
    const { t } = useI18n();
    const [text, setText] = useState(String(value));

    useEffect(() => {
        if (Number(text) !== value) {
            setText(String(value));
        }
    }, [value]);

    const change = (next) => {
        setText(next);
        if (Number(next) > 0) {
            onCommit(Number(next));
        }
    };

    return (
        <div className="relative w-24 shrink-0">
            <input type="number" inputMode="decimal" min="1" step={step} value={text} disabled={disabled} aria-label={t('nutrition.day.amount')} onChange={(event) => change(event.target.value)} className="field !py-1.5 pr-8 text-right font-mono !text-sm disabled:opacity-60" />
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-faint">{unit}</span>
        </div>
    );
}
