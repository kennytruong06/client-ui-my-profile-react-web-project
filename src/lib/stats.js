import { CATEGORIES, tasksForWeekday } from '@/data/schedule';
import { addDays, rangeKeys, weekdayOf } from '@/lib/date';

export function dayStatus(journal, key) {
    const tasks = tasksForWeekday(weekdayOf(key));
    const records = journal.days[key]?.tasks ?? {};
    const mandatory = tasks.filter((task) => task.mandatory);
    const mandatoryDone = mandatory.filter((task) => records[task.id]?.status === 'done').length;
    const optional = tasks.filter((task) => !task.mandatory);
    const optionalDone = optional.filter((task) => records[task.id]?.status === 'done').length;
    return {
        tasks,
        records,
        mandatoryTotal: mandatory.length,
        mandatoryDone,
        optionalTotal: optional.length,
        optionalDone,
        ratio: mandatory.length ? mandatoryDone / mandatory.length : 1,
        complete: mandatoryDone === mandatory.length,
    };
}

export function dayRatio(journal, key, today) {
    if (key < journal.trackingStart || key > today) {
        return null;
    }
    const status = dayStatus(journal, key);
    const touched = Object.keys(status.records).length > 0;
    if (key === today && !touched) {
        return null;
    }
    return status.ratio;
}

function emptyBucket() {
    return { planned: 0, done: 0, minutes: 0 };
}

export function streaks(journal, today) {
    let current = 0;
    let cursor = dayStatus(journal, today).complete ? today : addDays(today, -1);
    while (cursor >= journal.trackingStart && dayStatus(journal, cursor).complete) {
        current += 1;
        cursor = addDays(cursor, -1);
    }

    let best = 0;
    let run = 0;
    if (journal.trackingStart <= today) {
        rangeKeys(journal.trackingStart, today).forEach((key) => {
            run = dayStatus(journal, key).complete ? run + 1 : key === today ? run : 0;
            best = Math.max(best, run);
        });
    }

    return { current, best: Math.max(best, current) };
}

export function computeStats(journal, rangeStart, today) {
    const start = rangeStart > journal.trackingStart ? rangeStart : journal.trackingStart;
    const keys = start <= today ? rangeKeys(start, today) : [];

    const totals = { mandatoryPlanned: 0, mandatoryDone: 0, mandatorySkipped: 0, mandatoryMissed: 0, optionalPlanned: 0, optionalDone: 0 };
    const byCategory = Object.fromEntries(CATEGORIES.map((category) => [category, emptyBucket()]));
    const byWeekday = Array.from({ length: 7 }, emptyBucket);
    const skips = [];

    keys.forEach((key) => {
        const isToday = key === today;
        const weekday = weekdayOf(key);
        const { tasks, records } = dayStatus(journal, key);

        tasks.forEach((task) => {
            const record = records[task.id];
            const status = record?.status ?? null;
            if (isToday && !status) {
                return;
            }

            if (status === 'skipped') {
                skips.push({ date: key, task, note: record.note });
            }

            if (!task.mandatory) {
                totals.optionalPlanned += 1;
                if (status === 'done') {
                    totals.optionalDone += 1;
                    byCategory[task.category].minutes += task.minutes;
                }
                return;
            }

            totals.mandatoryPlanned += 1;
            byCategory[task.category].planned += 1;
            byWeekday[weekday].planned += 1;

            if (status === 'done') {
                totals.mandatoryDone += 1;
                byCategory[task.category].done += 1;
                byCategory[task.category].minutes += task.minutes;
                byWeekday[weekday].done += 1;
            } else if (status === 'skipped') {
                totals.mandatorySkipped += 1;
            } else {
                totals.mandatoryMissed += 1;
            }
        });
    });

    const discipline = totals.mandatoryPlanned ? totals.mandatoryDone / totals.mandatoryPlanned : null;

    return { start, keys, totals, byCategory, byWeekday, skips: skips.reverse(), discipline };
}

export function verdictKey(discipline) {
    if (discipline == null) {
        return 'empty';
    }
    if (discipline >= 0.85) {
        return 'great';
    }
    return discipline >= 0.6 ? 'good' : 'weak';
}
