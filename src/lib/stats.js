import { CATEGORIES, isTimed, tasksForWeekday } from '@/data/schedule';
import { ROADMAP_LENGTH } from '@/data/ieltsRoadmap';
import { addDays, rangeKeys, weekdayOf } from '@/lib/date';

export const STREAK_THRESHOLD = 0.5;
export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100, 200, 365];

export function dayStatus(journal, key) {
    const tasks = tasksForWeekday(weekdayOf(key));
    const records = journal.days[key]?.tasks ?? {};
    const mandatory = tasks.filter((task) => task.mandatory);
    const mandatoryDone = mandatory.filter((task) => records[task.id]?.status === 'done').length;
    const optional = tasks.filter((task) => !task.mandatory);
    const optionalDone = optional.filter((task) => records[task.id]?.status === 'done').length;
    const keepTarget = Math.ceil(mandatory.length * STREAK_THRESHOLD);
    return {
        tasks,
        records,
        mandatoryTotal: mandatory.length,
        mandatoryDone,
        optionalTotal: optional.length,
        optionalDone,
        ratio: mandatory.length ? mandatoryDone / mandatory.length : 1,
        keepTarget,
        kept: mandatoryDone >= keepTarget,
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
    return { planned: 0, done: 0, minutes: 0, targetMinutes: 0, timedDone: 0 };
}

export function streaks(journal, today) {
    let current = 0;
    let cursor = dayStatus(journal, today).kept ? today : addDays(today, -1);
    while (cursor >= journal.trackingStart && dayStatus(journal, cursor).kept) {
        current += 1;
        cursor = addDays(cursor, -1);
    }

    let best = 0;
    let run = 0;
    if (journal.trackingStart <= today) {
        rangeKeys(journal.trackingStart, today).forEach((key) => {
            run = dayStatus(journal, key).kept ? run + 1 : key === today ? run : 0;
            best = Math.max(best, run);
        });
    }

    return { current, best: Math.max(best, current) };
}

export function roadmapDayFor(journal, date) {
    const logs = journal.english.days;
    const assigned = Object.keys(logs).find((day) => logs[day].date === date);
    return assigned ? Number(assigned) : null;
}

export function suggestedRoadmapDay(journal) {
    const logs = journal.english.days;
    return Array.from({ length: ROADMAP_LENGTH }, (_, index) => index + 1).find((day) => !logs[day]?.date && !logs[day]?.done) ?? null;
}

export function categoryDayState(journal, key, category) {
    if (key < journal.trackingStart) {
        return { state: 'none', done: 0, need: 0, total: 0 };
    }
    const tasks = tasksForWeekday(weekdayOf(key)).filter((task) => task.category === category);
    const records = journal.days[key]?.tasks ?? {};
    const mandatory = tasks.filter((task) => task.mandatory);
    const done = mandatory.filter((task) => records[task.id]?.status === 'done').length;
    const need = Math.ceil(mandatory.length * STREAK_THRESHOLD);
    const anyDone = tasks.some((task) => records[task.id]?.status === 'done');
    let state = done >= need ? 'kept' : 'broken';
    if (mandatory.length === 0) {
        state = anyDone ? 'kept' : 'rest';
    }
    return { state, done, need, total: mandatory.length };
}

export function habitStreak(stateOf, journal, today) {
    let current = 0;
    let best = 0;
    if (journal.trackingStart <= today) {
        rangeKeys(journal.trackingStart, today).forEach((key) => {
            const { state } = stateOf(key);
            if (state === 'kept') {
                current += 1;
                best = Math.max(best, current);
            } else if (state === 'broken' && key !== today) {
                current = 0;
            }
        });
    }
    return { current, best };
}

export function habitDays(stateOf, today, count) {
    return rangeKeys(addDays(today, -(count - 1)), today).map((key) => {
        const { state } = stateOf(key);
        return { key, state: key === today && state === 'broken' ? 'pending' : state };
    });
}

export function streakDays(journal, today, count) {
    return rangeKeys(addDays(today, -(count - 1)), today).map((key) => {
        const status = dayStatus(journal, key);
        let state = 'broken';
        if (key < journal.trackingStart) {
            state = 'none';
        } else if (status.kept) {
            state = 'kept';
        } else if (key === today) {
            state = 'pending';
        }
        return { key, state, done: status.mandatoryDone, total: status.mandatoryTotal };
    });
}

export function nextMilestone(current) {
    return STREAK_MILESTONES.find((milestone) => milestone > current) ?? null;
}

export function computeStats(journal, rangeStart, today) {
    const start = rangeStart > journal.trackingStart ? rangeStart : journal.trackingStart;
    const keys = start <= today ? rangeKeys(start, today) : [];

    const totals = { mandatoryPlanned: 0, mandatoryDone: 0, mandatorySkipped: 0, mandatoryMissed: 0, optionalPlanned: 0, optionalDone: 0, targetMinutes: 0, actualMinutes: 0 };
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

            const bucket = byCategory[task.category];
            const actualMinutes = record?.minutes ?? task.minutes;
            const alternative = Boolean(task.allowAlternative) && record?.variant === 'alternative' && status === 'done';
            const timed = isTimed(task) || alternative;
            if (status === 'done' && timed) {
                bucket.minutes += actualMinutes;
            }
            if (timed && (task.mandatory || status === 'done')) {
                bucket.targetMinutes += task.minutes;
                totals.targetMinutes += task.minutes;
                if (status === 'done') {
                    bucket.timedDone += 1;
                    totals.actualMinutes += actualMinutes;
                }
            }

            if (!task.mandatory) {
                totals.optionalPlanned += 1;
                if (status === 'done') {
                    totals.optionalDone += 1;
                }
                return;
            }

            totals.mandatoryPlanned += 1;
            byCategory[task.category].planned += 1;
            byWeekday[weekday].planned += 1;

            if (status === 'done') {
                totals.mandatoryDone += 1;
                byCategory[task.category].done += 1;
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

export function ratioTone(ratio) {
    if (ratio >= 1) {
        return { text: 'text-brand-300', bar: 'bg-brand-500' };
    }
    if (ratio >= 0.7) {
        return { text: 'text-amber-300', bar: 'bg-amber-400' };
    }
    return { text: 'text-danger', bar: 'bg-danger' };
}
